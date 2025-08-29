// pages/dashboard/cursos/[id].tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { Curso } from '@/types/Curso';
import PrivateLayout from '@/components/layout/PrivateLayout';
import Link from 'next/link'; // Importa Link

const CursoDetallePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [curso, setCurso] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error al cargar los detalles del curso.');
        }
        const data: Curso = await response.json();
        setCurso(data);
        toast.success('Curso cargado exitosamente.');
      } catch (err: any) {
        console.error('Error fetching course details:', err);
        setError(err.message || 'Error al cargar los detalles del curso. Inténtalo de nuevo más tarde.');
        toast.error(err.message || 'Error al cargar los detalles del curso.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) {
    return (
        <PrivateLayout>
            <div className="flex justify-center items-center min-h-screen">
                <p>Cargando detalles del curso...</p>
            </div>
        </PrivateLayout>
    );
  }

  if (error) {
    return (
        <PrivateLayout>
            <div className="flex flex-col justify-center items-center min-h-screen text-red-600">
                <p className="text-xl font-semibold">¡Oops! Ha ocurrido un error.</p>
                <p className="text-lg mt-2">{error}</p>
                <button
                    onClick={() => router.push('/dashboard/cursos')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Volver a Cursos
                </button>
            </div>
        </PrivateLayout>
    );
  }

  if (!curso) {
    return (
        <PrivateLayout>
            <div className="flex flex-col justify-center items-center min-h-screen">
                <p className="text-xl font-semibold">Curso no encontrado.</p>
                <button
                    onClick={() => router.push('/dashboard/cursos')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Volver a Cursos
                </button>
            </div>
        </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
        <div className="container mx-auto p-8 bg-white shadow-lg rounded-lg">
            <h1 className="text-4xl font-bold mb-4 text-gray-800">{curso.titulo}</h1>
            <p className="text-gray-600 mb-6">{curso.descripcionLarga}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-semibold mb-3 text-gray-700">Información General</h2>
                    <p><strong>Categoría:</strong> {curso.categoria}</p>
                    <p><strong>Nivel:</strong> {curso.nivel}</p>
                    <p><strong>Idioma:</strong> {curso.idioma}</p>
                    <p><strong>Precio:</strong> {curso.moneda} {curso.precio?.toFixed(2)}</p>
                    <p><strong>Instructor:</strong> {curso.instructorNombre}</p>
                    <p><strong>Estado:</strong> {curso.publicado ? 'Publicado' : 'Borrador'}</p>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-3 text-gray-700">Requisitos</h2>
                    <ul className="list-disc pl-5">
                        {curso.requisitos?.map((req, index) => (
                            <li key={index}>{req}</li>
                        ))}
                    </ul>
                    <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-700">Lo que aprenderás</h2>
                    <ul className="list-disc pl-5">
                        {curso.loQueAprenderas?.map((obj, index) => (
                            <li key={index}>{obj}</li>
                        ))}
                    </ul>
                </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Contenido del Curso</h2>
            {curso.secciones && curso.secciones.length > 0 ? (
                curso.secciones.map((seccion) => (
                    <div key={seccion.id} className="mb-6 border p-4 rounded-lg bg-gray-50">
                        <h3 className="text-xl font-bold mb-3">{seccion.titulo}</h3>
                        {seccion.lecciones && seccion.lecciones.length > 0 ? (
                            <ul className="list-decimal pl-5">
                                {seccion.lecciones.map((leccion) => (
                                    <li key={leccion.id} className="mb-1">
                                        {leccion.titulo} ({leccion.duracionMinutos} min) - Tipo: {leccion.tipo}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No hay lecciones en esta sección.</p>
                        )}
                    </div>
                ))
            ) : (
                <p className="text-gray-500">No hay secciones definidas para este curso.</p>
            )}

            <div className="mt-8 text-center">
                <button
                    onClick={() => router.push(`/dashboard/instructor/crear?id=${curso.id}`)}
                    className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-md hover:bg-purple-700 transition-colors"
                >
                    Editar Curso
                </button>
            </div>
        </div>
    </PrivateLayout>
  );
};

export default CursoDetallePage;
