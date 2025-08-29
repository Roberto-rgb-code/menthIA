// pages/dashboard/instructor/index.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InstructorDashboardLayout from '@/components/layout/InstructorDashboardLayout';
import CourseCard from '@/components/instructor/CourseCard';
import { Curso } from '@/types/Curso';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { FaPlus, FaSearch, FaSpinner } from 'react-icons/fa';

const InstructorCoursesPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: userLoading } = useAuth();
  const [courses, setCourses] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Función para recargar los cursos (útil después de eliminar)
  const fetchCourses = async () => {
    if (userLoading) {
      return;
    }

    if (!user?.id) {
      console.warn("DEBUG: InstructorCoursesPage - user.id no está disponible. No se pueden cargar los cursos.");
      setLoading(false);
      setError("No se pudo obtener el ID del instructor. Por favor, inicie sesión.");
      return;
    }

    console.log(`DEBUG: InstructorCoursesPage - Intentando cargar cursos para instructorId: ${user.id}`);

    try {
      setLoading(true);
      const response = await fetch(`/api/courses?instructorId=${user.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al cargar el curso.' }));
        throw new Error(errorData.message || `Error al cargar cursos: ${response.statusText}`);
      }
      const data: Curso[] = await response.json();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || "Error desconocido al cargar los cursos.");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user, userLoading]); // Dependencias para recargar cuando el usuario o su estado de carga cambian

  const handleCreateNewCourse = () => {
    router.push('/dashboard/instructor/crear');
  };

  // --- NUEVA FUNCIÓN PARA ELIMINAR CURSO ---
  const handleDeleteCourse = async (courseId: string) => {
    if (!user?.id) {
      alert('Debes estar autenticado para eliminar cursos.');
      return;
    }

    // Confirmación al usuario antes de eliminar
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.');
    if (!confirmDelete) {
      return; // El usuario canceló la eliminación
    }

    try {
      setLoading(true); // Puedes mostrar un spinner o similar mientras se elimina
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // Podrías añadir un token de autorización aquí si lo usas
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido al eliminar el curso.' }));
        throw new Error(errorData.message || `Error al eliminar curso: ${response.statusText}`);
      }

      // Si la eliminación fue exitosa, actualiza el estado para quitar el curso de la lista
      setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
      alert('Curso eliminado exitosamente.'); // O usa un sistema de notificaciones más avanzado

    } catch (err: any) {
      setError(err.message || "Error desconocido al eliminar el curso.");
      console.error("Error deleting course:", err);
      alert(`Error al eliminar el curso: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/dashboard/instructor/crear?id=${courseId}`);
  };


  const filteredCourses = courses.filter(course =>
    course.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.descripcionCorta?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userLoading || loading) {
    return (
      <InstructorDashboardLayout>
        <div className="flex justify-center items-center h-full min-h-[50vh]">
          <FaSpinner className="animate-spin text-5xl text-blue-500" />
          <p className="ml-4 text-xl text-gray-700">Cargando cursos...</p>
        </div>
      </InstructorDashboardLayout>
    );
  }

  if (error) {
    return (
      <InstructorDashboardLayout>
        <div className="flex justify-center items-center h-full min-h-[50vh] text-red-600">
          <p>{error}</p>
        </div>
      </InstructorDashboardLayout>
    );
  }

  return (
    <InstructorDashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cursos</h1>
        <button
          onClick={handleCreateNewCourse}
          className="bg-purple-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-purple-700 transition-colors duration-300 shadow-md flex items-center"
        >
          <FaPlus className="mr-2" /> Nuevo curso
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Busca en tus cursos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-3 border border-gray-300 rounded-md w-full max-w-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <select className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
            <option>Más recientes</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <p className="text-gray-600 col-span-full text-center py-10">Aún no has creado ningún curso. ¡Haz clic en "Nuevo curso" para empezar!</p>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => handleEditCourse(course.id)} // Llama a la nueva función de edición
              onDelete={() => handleDeleteCourse(course.id)} // Llama a la nueva función de eliminación
              isInstructorView={true}
            />
          ))
        )}
      </div>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg shadow-sm">
        <h3 className="font-bold text-lg mb-2">Información Importante sobre Cursos Gratuitos</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Los nuevos cursos gratuitos (publicados después del 17 de marzo de 2020) deben tener menos de 2 horas de contenido de video.</li>
          <li>Los cursos gratuitos existentes (publicados antes del 17 de marzo de 2020) que contengan más de 2 horas de contenido de video se mantendrán publicados.</li>
          <li>Todos los cursos gratuitos solo consistirán en contenido de video y recursos. El certificado de finalización, las preguntas y respuestas, y los mensajes directos <span className="font-semibold">solo</span> estarán disponibles en las inscripciones de pago.</li>
        </ul>
        <p className="mt-4 text-sm">
          Para obtener más información sobre la nueva experiencia de los cursos gratuitos y la política, consulta las <Link href="#" className="text-blue-600 hover:underline">preguntas frecuentes</Link> en el Teaching Center.
        </p>
        <button className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm">
          Descartar
        </button>
      </div>

      <div className="mt-8 p-6 bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-sm">
        <h3 className="font-bold text-lg mb-2">Hemos actualizado los exámenes de prueba para que puedas actualizar los tuyos.</h3>
        <p className="text-sm">
          Gracias a nuestras mejoras de creación, nuevos tipos de preguntas y funciones de IA generativa, podrás maximizar el potencial de preparación para la certificación de tus exámenes de prueba.
        </p>
        <div className="mt-4 flex space-x-4">
          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 text-sm">
            Explora las mejoras
          </button>
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm">
            Descartar
          </button>
        </div>
      </div>
    </InstructorDashboardLayout>
  );
};

export default InstructorCoursesPage;
