// pages/dashboard/cursos.tsx
import React, { useState, useEffect } from 'react';
import PublicLayout from '@/components/layout/PublicLayout'; // Asumiendo que tienes un layout público
import CourseCard from '@/components/CourseCard';
import CategoryFilter from '@/components/CategoryFilter'; // Asumiendo este componente
import { Curso } from '@/types/Curso';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

const CursosPage: React.FC = () => {
  const [courses, setCourses] = useState<Curso[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch courses
        const coursesResponse = await fetch('/api/courses');
        if (!coursesResponse.ok) {
          const errorText = await coursesResponse.text();
          console.error(`Error al cargar los cursos (Status: ${coursesResponse.status}):`, errorText);
          throw new Error(`Error al cargar los cursos: ${coursesResponse.status} ${coursesResponse.statusText}. Respondió: ${errorText}`);
        }
        const coursesData: Curso[] = await coursesResponse.json();
        setCourses(coursesData);

        // Fetch categories (assuming a separate API endpoint for categories)
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {
          const errorText = await categoriesResponse.text();
          console.error(`Error al cargar las categorías (Status: ${categoriesResponse.status}):`, errorText);
          throw new Error(`Error al cargar las categorías: ${categoriesResponse.status} ${categoriesResponse.statusText}. Respondió: ${errorText}`);
        }
        const categoriesData: { categories: string[] } = await categoriesResponse.json();
        setCategories(['all', ...categoriesData.categories]);

      } catch (err: any) {
        console.error("Error fetching data:", err);
        setError(err.message || 'No se pudieron cargar los datos.');
        toast.error(err.message || 'No se pudieron cargar los cursos o categorías.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredCourses = selectedCategory === 'all'
    ? courses
    : courses.filter(course => course.categoria === selectedCategory);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewCourse = (courseId: string) => {
    router.push(`/cursos/${courseId}`); // Navegar a la página de detalle del curso
  };

  return (
    <PublicLayout>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Todos los Cursos</h1>

        <CategoryFilter categories={categories} selectedCategory={selectedCategory} onSelectCategory={handleCategoryChange} />

        {loading && (
          <div className="flex justify-center items-center h-64">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <p className="ml-4 text-lg text-gray-700">Cargando cursos...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 text-lg my-8">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center text-gray-600 text-lg my-8">
            <p>No se encontraron cursos en esta categoría.</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {!loading && !error && filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isInstructorView={false} // Vista de usuario público
              onView={() => handleViewCourse(course.id!)}
            />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
};

export default CursosPage;
