// pages/dashboard/cursos.tsx
import React, { useEffect, useState } from 'react';
import PrivateLayout from '../../components/layout/PrivateLayout'; // Asegúrate de que la ruta sea correcta
import { Curso } from '../../types/Curso'; // Asegúrate de que la ruta sea correcta
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaPlus, FaSpinner, FaBookOpen, FaSearch } from 'react-icons/fa'; // Iconos actualizados con FaSearch

// Importaciones de los componentes
import CourseCard from '../../components/courses/CourseCard'; 
import CategorySidebar from '../../components/courses/CategorySidebar'; // Importa el nuevo componente del sidebar

const CursosPage: React.FC = () => {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [categories, setCategories] = useState<string[]>([]); // Estado para las categorías únicas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // Estado para la categoría seleccionada

  // NOTA IMPORTANTE: En una aplicación real, aquí deberías:
  // 1. Obtener el rol del usuario actual (ej. de tu AuthContext).
  // 2. Usar ese rol para determinar si mostrar el botón "Crear Nuevo Curso".
  const currentUserIsInstructor = true; // Placeholder: reemplaza con lógica de autenticación real

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch de los cursos
        const coursesResponse = await fetch('/api/courses');
        if (!coursesResponse.ok) {
          throw new Error('Error al cargar los cursos');
        }
        const coursesData: Curso[] = await coursesResponse.json();
        setCursos(coursesData);

        // Fetch de las categorías
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          throw new Error('Error al cargar las categorías');
        }
        const categoriesData: string[] = await categoriesResponse.json();
        setCategories(categoriesData);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Hubo un problema al cargar los datos.');
        toast.error('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lógica de filtrado combinada: búsqueda y categoría
  const filteredCursos = cursos.filter(curso => {
    const matchesSearchTerm = 
      curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.descripcionCorta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.instructorNombre.toLowerCase().includes(searchTerm.toLowerCase());
      // No incluimos categoría en la búsqueda de texto si ya tenemos un filtro dedicado

    const matchesCategory = 
      selectedCategory === null || // Si no hay categoría seleccionada, todos coinciden
      curso.categoria.toLowerCase() === selectedCategory.toLowerCase();
      
    return matchesSearchTerm && matchesCategory;
  });

  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center h-screen">
          <FaSpinner className="animate-spin text-5xl text-blue-500" />
          <p className="ml-4 text-xl text-gray-700">Cargando cursos y categorías...</p>
        </div>
      </PrivateLayout>
    );
  }

  if (error) {
    return (
      <PrivateLayout>
        <div className="flex flex-col justify-center items-center h-screen text-red-600">
          <p className="text-2xl font-semibold mb-4">Error al cargar:</p>
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
          >
            Reintentar
          </button>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center">
          <FaBookOpen className="inline-block mr-3 text-blue-600" />
          Explora Nuestros Cursos
        </h1>

        {/* Barra de Búsqueda (Udemy style) */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Busca cualquier cosa, desde diseño a desarrollo web..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        {/* Botón para instructores */}
        {currentUserIsInstructor && (
          <div className="text-center mb-8">
            <Link href="/dashboard/instructor" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-colors duration-300">
              ¿Eres un instructor? Ir a tu panel
            </Link>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar de Categorías */}
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Contenido Principal: Lista de Cursos */}
          <div className="flex-grow">
            {filteredCursos.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg shadow-inner">
                <p className="text-2xl font-semibold text-gray-600 mb-4">
                  ¡No hay cursos que coincidan con tu búsqueda o categoría!
                </p>
                <p className="text-lg text-gray-500">Intenta con otros términos o filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCursos.map((curso) => (
                  <CourseCard key={curso.id} curso={curso} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default CursosPage;
