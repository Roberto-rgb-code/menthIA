// pages/cursos/[id]/leccion/[leccionId].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import PrivateLayout from '../../../../components/layout/PrivateLayout'; // Ajusta la ruta a tu PrivateLayout
import { Curso, Leccion, Seccion, ProgresoLeccion } from '../../../../types/Curso'; // Tus interfaces
import { toast } from 'react-toastify';
import { FaSpinner, FaCheckCircle, FaDownload, FaTimesCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Link from 'next/link';

// Asegúrate de que el componente LessonPlayer esté creado.
// Lo crearemos JUSTO DESPUÉS de este archivo.
import LessonPlayer from '../../../../components/courses/LessonPlayer';

// Mock de hook de autenticación/suscripción (reemplazar con tu implementación real)
// En una app real, necesitarías saber si el usuario está logueado y si compró el curso.
// import { useAuth } from '../../../hooks/useAuth';
// import { useUserSubscription } from '../../../hooks/useUserSubscription'; 
const useAuth = () => ({ user: { uid: 'mockUserId', displayName: 'Mock User' } }); // Placeholder
const useUserSubscription = (userId: string | undefined, courseId: string | undefined) => ({
  hasAccess: true, // Placeholder: Asume acceso total por ahora
  loadingSubscription: false,
});


const LeccionPage: React.FC = () => {
  const router = useRouter();
  const { id: courseId, leccionId } = router.query;

  const { user } = useAuth(); // Obtén el usuario actual
  const { hasAccess, loadingSubscription } = useUserSubscription(user?.uid, courseId as string); // Verifica el acceso

  const [course, setCourse] = useState<Curso | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Leccion | null>(null);
  const [currentSection, setCurrentSection] = useState<Seccion | null>(null);
  const [lessonProgress, setLessonProgress] = useState<ProgresoLeccion | null>(null); // Estado del progreso de esta lección
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funciones para navegar a la lección anterior/siguiente
  const getNeighboringLessons = () => {
    if (!course || !currentLesson) return { prevLesson: null, nextLesson: null };

    const allLessons: Leccion[] = [];
    course.secciones.sort((a, b) => a.orden - b.orden).forEach(sec => {
      sec.lecciones.sort((a, b) => a.orden - b.orden).forEach(lesson => {
        allLessons.push(lesson);
      });
    });

    const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id);
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return { prevLesson, nextLesson };
  };

  const { prevLesson, nextLesson } = getNeighboringLessons();

  useEffect(() => {
    const fetchLessonDetails = async () => {
      if (!courseId || !leccionId) return;

      setLoading(true);
      try {
        // 1. Obtener detalles del curso completo
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) throw new Error('Curso no encontrado.');
        const fetchedCourse: Curso = await courseResponse.json();
        setCourse(fetchedCourse);

        // 2. Buscar la lección y sección actual
        let foundLesson: Leccion | null = null;
        let foundSection: Seccion | null = null;
        for (const section of fetchedCourse.secciones) {
          foundLesson = section.lecciones.find(l => l.id === leccionId) || null;
          if (foundLesson) {
            foundSection = section;
            break;
          }
        }

        if (!foundLesson) {
          throw new Error('Lección no encontrada en este curso.');
        }
        setCurrentLesson(foundLesson);
        setCurrentSection(foundSection);

        // 3. Obtener el progreso del usuario para esta lección (TODO: implementar API)
        // Por ahora, un mock:
        // const progressResponse = await fetch(`/api/progress/${user?.uid}/${courseId}/${leccionId}`);
        // if (progressResponse.ok) {
        //   setLessonProgress(await progressResponse.json());
        // } else {
        //   setLessonProgress({ leccionId: leccionId as string, completada: false });
        // }
        setLessonProgress({ leccionId: leccionId as string, completada: false }); // Mock inicial

      } catch (err: any) {
        console.error('Error fetching lesson details:', err);
        setError(err.message || 'Hubo un problema al cargar la lección.');
        toast.error('No se pudo cargar la lección.');
        router.push(`/cursos/${courseId}`); // Redirige de vuelta a la página del curso
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid || !user) { // Espera al user o si no hay user loggeado (para vistas previas)
      fetchLessonDetails();
    }
    
  }, [courseId, leccionId, router, user]);


  // Control de Acceso:
  // Si la suscripción está cargando O el curso aún no se ha cargado O no se ha encontrado la lección
  // O el usuario no tiene acceso Y la lección no es de vista previa.
  if (loading || loadingSubscription || !course || !currentLesson || !currentSection) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center h-screen">
          <FaSpinner className="animate-spin text-5xl text-blue-500" />
          <p className="ml-4 text-xl text-gray-700">Cargando lección...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <div className="flex flex-col justify-center items-center h-screen text-red-600">
          <p className="text-2xl font-semibold mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Volver
          </button>
        </div>
      </PrivateLayout>
    );
  }

  // Verificar si el usuario tiene acceso a esta lección (solo si no es de vista previa)
  const canAccessLesson = hasAccess || currentLesson.esVistaPrevia;

  if (!canAccessLesson) {
    return (
      <PrivateLayout>
        <div className="flex flex-col justify-center items-center h-screen bg-red-50 text-red-700 p-8 rounded-lg shadow-md mx-auto max-w-lg">
          <FaTimesCircle className="text-6xl mb-4" />
          <h2 className="text-3xl font-bold mb-3">Acceso Denegado</h2>
          <p className="text-lg text-center mb-6">
            Necesitas comprar el curso para acceder a esta lección.
            Explora las <span className="font-semibold text-blue-800">lecciones de vista previa</span> gratuitas o{' '}
            <Link href={`/cursos/${courseId}`} className="text-blue-600 hover:underline">
              inscríbete al curso
            </Link>
            .
          </p>
          <Link href={`/cursos/${courseId}`} passHref>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
              Ir a la página del curso
            </button>
          </Link>
        </div>
      </PrivateLayout>
    );
  }

  // Función para marcar la lección como completada (TODO: Implementar API)
  const handleCompleteLesson = async () => {
    if (!user?.uid || !courseId || !leccionId) {
      toast.error('Necesitas iniciar sesión para marcar el progreso.');
      return;
    }
    if (lessonProgress?.completada) {
      toast.info('Esta lección ya está marcada como completada.');
      return;
    }

    try {
      // TODO: Llamar a tu API /api/progress/complete-lesson
      // const response = await fetch('/api/progress/complete-lesson', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userId: user.uid, courseId, leccionId }),
      // });
      // if (!response.ok) throw new Error('Error al actualizar el progreso.');

      // const data = await response.json();
      // setLessonProgress(data.progresoLeccion); // Actualiza el estado local
      
      // Mock de actualización de progreso:
      setLessonProgress(prev => ({ ...prev!, completada: true, fechaCompletado: new Date().toISOString() }));
      toast.success('Lección marcada como completada. ¡Bien hecho!');
    } catch (err: any) {
      console.error('Error al completar la lección:', err);
      toast.error('No se pudo marcar la lección como completada.');
    }
  };

  return (
    <PrivateLayout>
      <div className="container mx-auto p-4 sm:p-8">
        {/* Breadcrumbs / Navegación */}
        <nav className="text-sm font-semibold text-gray-600 mb-6">
          <Link href="/dashboard/cursos" className="hover:text-blue-600">Cursos</Link>
          <span className="mx-2">&gt;</span>
          <Link href={`/cursos/${courseId}`} className="hover:text-blue-600">{course.titulo}</Link>
          <span className="mx-2">&gt;</span>
          <span className="text-blue-600">{currentLesson.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna Principal - Contenido de la Lección */}
          <div className="lg:col-span-3 bg-white shadow-lg rounded-lg p-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">{currentLesson.titulo}</h1>
            <p className="text-lg text-gray-600 mb-4">{currentSection?.titulo}</p>

            {/* Reproductor de Lección */}
            <div className="mb-6">
              <LessonPlayer lesson={currentLesson} />
            </div>

            {/* Descripción de la Lección */}
            {currentLesson.descripcion && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Acerca de esta lección</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{currentLesson.descripcion}</p>
              </div>
            )}

            {/* Recursos Descargables */}
            {currentLesson.recursosDescargables && currentLesson.recursosDescargables.length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">Recursos Descargables</h2>
                <ul className="space-y-2">
                  {currentLesson.recursosDescargables.map((resource, index) => (
                    <li key={index}>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center text-blue-600 hover:underline hover:text-blue-800"
                      >
                        <FaDownload className="mr-2" /> {resource.nombre}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botón Marcar como Completado */}
            {!lessonProgress?.completada ? (
              <button
                onClick={handleCompleteLesson}
                className="w-full py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700 transition duration-300 flex items-center justify-center mt-6"
              >
                <FaCheckCircle className="mr-2" /> Marcar como Completada
              </button>
            ) : (
              <div className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg text-lg font-semibold flex items-center justify-center mt-6">
                <FaCheckCircle className="mr-2" /> Lección Completada
              </div>
            )}

            {/* Navegación entre lecciones */}
            <div className="mt-8 flex justify-between items-center border-t pt-6 border-gray-200">
              {prevLesson ? (
                <Link href={`/cursos/${courseId}/leccion/${prevLesson.id}`} passHref>
                  <button className="flex items-center text-blue-600 hover:text-blue-800 font-semibold py-2 px-4 rounded-md border border-blue-600 hover:border-blue-800 transition-colors duration-200">
                    <FaChevronLeft className="mr-2" /> {prevLesson.titulo}
                  </button>
                </Link>
              ) : (
                <span className="py-2 px-4 text-gray-400"></span>
              )}

              {nextLesson ? (
                <Link href={`/cursos/${courseId}/leccion/${nextLesson.id}`} passHref>
                  <button className="flex items-center text-blue-600 hover:text-blue-800 font-semibold py-2 px-4 rounded-md border border-blue-600 hover:border-blue-800 transition-colors duration-200">
                    {nextLesson.titulo} <FaChevronRight className="ml-2" />
                  </button>
                </Link>
              ) : (
                <span className="py-2 px-4 text-gray-400"></span>
              )}
            </div>

          </div>

          {/* Columna Lateral - Temario Completo (mini-currículum) */}
          <div className="lg:col-span-1 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Temario del Curso</h2>
            {/* Aquí podrías renderizar una versión simplificada del CourseCurriculum o el mismo componente */}
            {course.secciones && (
              <ul className="space-y-3">
                {course.secciones.sort((a,b) => a.orden - b.orden).map(section => (
                  <li key={section.id}>
                    <h3 className="font-semibold text-blue-700">{section.orden + 1}. {section.titulo}</h3>
                    <ul className="pl-4 mt-1 space-y-1 text-sm">
                      {section.lecciones.sort((a,b) => a.orden - b.orden).map(lesson => (
                        <li key={lesson.id} className={`${lesson.id === leccionId ? 'text-blue-600 font-bold' : 'text-gray-700'} ${lesson.esVistaPrevia ? 'italic' : ''}`}>
                          <Link href={`/cursos/${courseId}/leccion/${lesson.id}`} passHref>
                            <span className="hover:text-blue-500 cursor-pointer">
                              {lesson.tipo === 'video' && '▶️ '}
                              {lesson.tipo === 'articulo' && '📄 '}
                              {lesson.tipo === 'quiz' && '❓ '}
                              {lesson.tipo === 'descargable' && '💾 '}
                              {lesson.titulo}
                              {lesson.esVistaPrevia && <span className="text-xs text-blue-400 ml-1">(Preview)</span>}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default LeccionPage;