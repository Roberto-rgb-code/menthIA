// pages/dashboard/instructor/crear.tsx
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight, FaSave, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

// Importaciones de tipos y hooks (usando alias @/)
import { Curso } from '@/types/Curso';
import { useAuth } from '@/hooks/useAuth'; // Asegúrate de que este hook exista y funcione

// Importa los componentes de los pasos usando alias
import CoursePlanningStep from '@/components/instructor/create-course/CoursePlanningStep';
import CourseObjectivesStep from '@/components/instructor/create-course/CourseObjectivesStep';
import CourseCurriculumStep from '@/components/instructor/create-course/CourseCurriculumStep';
import CourseLandingPageStep from '@/components/instructor/create-course/CourseLandingPageStep';
import CoursePricingStep from '@/components/instructor/create-course/CoursePricingStep';
import CoursePromotionsStep from '@/components/instructor/create-course/CoursePromotionsStep';
import CourseMessagesStep from '@/components/instructor/create-course/CourseMessagesStep';
import CourseReviewPublishStep from '@/components/instructor/create-course/CourseReviewPublishStep';

// Importa el sidebar de navegación específico para la creación de cursos
import CreateCourseSidebar from '@/components/instructor/create-course/CreateCourseSidebar';

// Importa el layout privado general (sin el sidebar del instructor)
import PrivateLayout from '@/components/layout/PrivateLayout'; // Usando PrivateLayout

// Define los pasos del formulario
const STEPS = [
  'Planifica tu curso',
  'Estudiantes objetivo',
  'Estructura del curso',
  'Página de inicio del curso',
  'Precios',
  'Promociones',
  'Mensajes del curso',
  'Enviar para revisión',
];

const CrearCursoPage: React.FC = () => {
  const router = useRouter();
  const { id: courseIdFromQuery } = router.query;
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<Partial<Curso>>({
    id: undefined,
    titulo: '',
    descripcionCorta: '',
    descripcionLarga: '',
    categoria: '',
    nivel: 'todos',
    idioma: 'Español',
    precio: 0,
    moneda: 'MXN',
    instructorId: '', // Se inicializa vacío, se llenará desde useAuth
    instructorNombre: '', // Se inicializa vacío, se llenará desde useAuth
    imagenUrl: '',
    videoIntroduccionUrl: '',
    publicado: false,
    requisitos: [''],
    loQueAprenderas: [''],
    secciones: [],
    duracionEstimada: 0,
    fechaCreacion: '', // Inicializar como string vacío para evitar hidratación mismatch
    fechaActualizacion: '', // Inicializar como string vacío para evitar hidratación mismatch
    dedicacionTiempo: 'Todavía no he decidido',
    publicoObjetivo: '',
    mensajeBienvenida: '',
    mensajeFelicidades: '',
    descuentoInicial: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Asigna el ID y nombre del instructor desde el contexto de autenticación
    if (user?.id && user?.name) { // Asume que tu objeto 'user' tiene 'id' y 'name'
      setCourseData(prev => ({
        ...prev,
        instructorId: user.id,
        instructorNombre: user.name,
      }));
    } else {
      // Opcional: Redirigir si el usuario no está autenticado como instructor
      // toast.error('Debes iniciar sesión como instructor para crear cursos.');
      // router.push('/login');
    }

    // Cargar datos del curso si hay un ID en la URL (modo edición)
    if (courseIdFromQuery && typeof courseIdFromQuery === 'string') {
      const fetchCourse = async () => {
        try {
          const response = await fetch(`/api/courses/${courseIdFromQuery}`);
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido al cargar el curso.' }));
            throw new Error(errorData.message || 'No se pudo cargar el curso para edición.');
          }
          const data: Curso = await response.json();
          // Aseguramos que los arrays sean al menos un array vacío o con un elemento vacío
          data.requisitos = data.requisitos && data.requisitos.length > 0 ? data.requisitos : [''];
          data.loQueAprenderas = data.loQueAprenderas && data.loQueAprenderas.length > 0 ? data.loQueAprenderas : [''];
          data.secciones = data.secciones || [];

          setCourseData(data);
          toast.success('Curso cargado para edición.');
        } catch (error: any) {
          console.error('Error al cargar curso para edición:', error);
          toast.error(error.message || 'Error al cargar el curso para edición.');
          router.push('/dashboard/instructor'); // Redirige al panel de cursos del instructor
        }
      };
      fetchCourse();
    }
  }, [router.query.id, router, user]); // Dependencias: router.query.id, router, y el objeto user

  const handleChange = (field: string, value: any) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCourse = async () => {
    setIsSaving(true);
    try {
      if (!courseData.instructorId || !courseData.instructorNombre) {
        toast.error('Error: ID y Nombre del Instructor no definidos. Por favor, asegúrate de estar logueado.');
        setIsSaving(false);
        return;
      }

      const url = courseIdFromQuery
        ? `/api/courses/${courseIdFromQuery}`
        : '/api/courses';

      const method = courseIdFromQuery ? 'PUT' : 'POST';

      // Filtrar arrays para evitar enviar elementos vacíos a la API
      const dataToSend = {
        ...courseData,
        // Asigna fechaCreacion solo si es un nuevo curso, de lo contrario, se mantiene la existente de la DB
        fechaCreacion: courseData.fechaCreacion || new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(), // Siempre actualiza la fecha de actualización
        requisitos: courseData.requisitos?.filter(Boolean) || [],
        loQueAprenderas: courseData.loQueAprenderas?.filter(Boolean) || [],
        secciones: courseData.secciones?.map(sec => ({
          ...sec,
          lecciones: sec.lecciones?.filter(Boolean).map(lec => ({
            ...lec,
            recursosDescargables: lec.recursosDescargables?.filter(Boolean) || [],
          })) || [],
        })) || [],
        mensajeBienvenida: courseData.mensajeBienvenida || '',
        mensajeFelicidades: courseData.mensajeFelicidades || '',
        descuentoInicial: courseData.descuentoInicial || '',
      };

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al guardar el curso: ${response.statusText}`);
      }

      const result = await response.json();
      toast.success('Progreso guardado exitosamente!');
      console.log('Curso guardado/actualizado:', result);

      if (!courseIdFromQuery && result.cursoId) {
        setCourseData(prev => ({ ...prev, id: result.cursoId }));
        router.replace(`/dashboard/instructor/crear?id=${result.cursoId}`, undefined, { shallow: true });
      }

    } catch (error: any) {
      console.error('Error al guardar el curso:', error);
      toast.error(error.message || 'Error al guardar el progreso del curso.');
    } finally {
      setIsSaving(false);
    }
  };

  const isCourseReady =
    courseData.titulo &&
    courseData.descripcionLarga &&
    courseData.imagenUrl &&
    (courseData.secciones && courseData.secciones.length > 0 &&
      courseData.secciones.every(s => s.titulo && s.lecciones.length > 0 &&
        s.lecciones.every(l => l.titulo && l.tipo && l.contenidoUrl)
      )
    ) &&
    (courseData.precio !== undefined && courseData.precio > 0);


  const handleNextStep = async () => {
    if (currentStep === 0) {
      if (!courseData.categoria || !courseData.idioma || !courseData.nivel || !courseData.dedicacionTiempo) {
        toast.error('Por favor, completa los campos de planificación del curso.');
        return;
      }
    } else if (currentStep === 1) {
      if (!courseData.loQueAprenderas || courseData.loQueAprenderas.every(item => !item.trim()) || courseData.loQueAprenderas.length < 1) {
        toast.error('Por favor, añade al menos un objetivo de aprendizaje.');
        return;
      }
    } else if (currentStep === 2) {
      if (!courseData.secciones || courseData.secciones.length === 0 || courseData.secciones.some(s => !s.titulo.trim() || s.lecciones.length === 0 || s.lecciones.some(l => !l.titulo.trim()))) {
        toast.error('Por favor, añade al menos una sección con lecciones válidas (título de sección y título de lección).');
        return;
      }
    } else if (currentStep === 3) {
      if (!courseData.titulo || !courseData.descripcionLarga || !courseData.imagenUrl) {
        toast.error('Por favor, completa el título, descripción larga y la URL de la imagen de portada.');
        return;
      }
    } else if (currentStep === 4) {
      if (courseData.precio === undefined || courseData.precio <= 0) {
        toast.error('Por favor, ingresa un precio válido (mayor a 0) para el curso.');
        return;
      }
    }

    await handleSaveCourse();

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handlePublishCourse = async () => {
    if (!isCourseReady) {
      toast.error('El curso no cumple con los requisitos mínimos para ser publicado. Por favor, revisa todos los pasos.');
      return;
    }

    const courseToPublish = {
      ...courseData,
      publicado: true,
      fechaActualizacion: new Date().toISOString(),
      requisitos: courseData.requisitos?.filter(Boolean) || [],
      loQueAprenderas: courseData.loQueAprenderas?.filter(Boolean) || [],
      secciones: courseData.secciones?.map(sec => ({
        ...sec,
        lecciones: sec.lecciones?.filter(Boolean).map(lec => ({
          ...lec,
          recursosDescargables: lec.recursosDescargables?.filter(Boolean) || [],
        })) || [],
      })) || [],
      mensajeBienvenida: courseData.mensajeBienvenida || '',
      mensajeFelicidades: courseData.mensajeFelicidades || '',
      descuentoInicial: courseData.descuentoInicial || '',
    };

    setIsSaving(true);
    try {
      if (!courseIdFromQuery) {
        toast.error('Error: El curso no tiene un ID asignado para publicar. Por favor, guarda el curso primero.');
        setIsSaving(false);
        return;
      }

      const url = `/api/courses/${courseIdFromQuery}`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseToPublish),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al publicar el curso: ${response.statusText}`);
      }

      toast.success('¡Curso publicado exitosamente!');
      router.push('/dashboard/instructor');
    } catch (error: any) {
      console.error('Error al publicar el curso:', error);
      toast.error(error.message || 'Error al publicar el curso.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepComponent = () => {
    switch (currentStep) {
      case 0:
        return (
          <CoursePlanningStep
            courseData={courseData}
            handleChange={handleChange}
            categories={['Desarrollo', 'Negocios', 'Finanzas y contabilidad', 'Informática y software', 'Productividad en la oficina', 'Desarrollo personal', 'Diseño', 'Marketing', 'Estilo de vida', 'Fotografía y video', 'Salud y fitness', 'Música', 'Enseñanza y disciplinas académicas', 'Aún no lo tengo claro']}
          />
        );
      case 1:
        return (
          <CourseObjectivesStep
            courseData={courseData}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <CourseCurriculumStep
            courseData={courseData}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <CourseLandingPageStep
            courseData={courseData}
            handleChange={handleChange}
          />
        );
      case 4:
        return (
          <CoursePricingStep
            courseData={courseData}
            handleChange={handleChange}
          />
        );
      case 5:
        return (
          <CoursePromotionsStep
            courseData={courseData}
            handleChange={handleChange}
          />
        );
      case 6:
        return (
          <CourseMessagesStep
            courseData={courseData}
            handleChange={handleChange}
          />
        );
      case 7:
        return (
          <CourseReviewPublishStep
            courseData={courseData}
            onPublish={handlePublishCourse}
            isSaving={isSaving}
          />
        );
      default:
        return (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Error: Paso no encontrado</h2>
            <p className="text-gray-600">Parece que hay un error con la navegación de los pasos.</p>
          </div>
        );
    }
  };

  return (
    <PrivateLayout> {/* Cambiado de InstructorDashboardLayout a PrivateLayout */}
      <div className="flex min-h-screen">
        {/* El sidebar CreateCourseSidebar se mantiene aquí, ya que es parte del formulario de creación */}
        <CreateCourseSidebar
          steps={STEPS}
          currentStepIndex={currentStep}
          onSelectStep={setCurrentStep}
          courseId={typeof courseIdFromQuery === 'string' ? courseIdFromQuery : null}
        />

        {/* Contenido Principal del formulario */}
        <div className="flex-grow p-8 bg-gray-100">
          <div className="flex justify-between items-center mb-6">
            <Link href="/dashboard/instructor" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
              <FaArrowLeft className="mr-2" />
              Volver a mis cursos
            </Link>
            <div className="flex items-center space-x-4">
              {courseData.id && (
                <span className="text-sm text-gray-500">ID del curso: {courseData.id}</span>
              )}
              <button
                onClick={handleSaveCourse}
                disabled={isSaving}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isSaving ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Guardando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Guardar
                  </>
                )}
              </button>
              {currentStep === STEPS.length - 1 && ( // Mostrar botón "Publicar" solo en el último paso
                <button
                  onClick={handlePublishCourse}
                  disabled={isSaving || !isCourseReady} // Deshabilitar si no está listo para publicar
                  className={`flex items-center px-8 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    isSaving || !isCourseReady ? 'bg-purple-400 text-purple-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> Publicando...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" /> Publicar Curso
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="relative">
            {renderStepComponent()}
          </div>

          {/* Navegación Inferior */}
          <div className="flex justify-between mt-8 py-4 px-6 bg-white rounded-lg shadow-md sticky bottom-0 z-10">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 0}
              className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                currentStep === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
            >
              <FaArrowLeft className="mr-2" /> Anterior
            </button>
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center px-6 py-3 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200"
              >
                Siguiente <FaArrowRight className="ml-2" />
              </button>
            ) : (
              // Mostrar "Guardar y Salir" solo en el último paso si no es el botón de publicar
              <button
                onClick={handleSaveCourse}
                disabled={isSaving}
                className={`flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isSaving ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Guardando...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Guardar y Salir
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default CrearCursoPage;
