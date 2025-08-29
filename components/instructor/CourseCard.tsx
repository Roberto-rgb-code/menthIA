// components/instructor/CourseCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Curso } from '@/types/Curso';
import { FaEdit, FaTrash } from 'react-icons/fa';

interface CourseCardProps {
  course: Curso;
  onEdit: (courseId: string) => void;
  onDelete?: (courseId: string) => void; // Opcional
  isInstructorView?: boolean; // Para diferenciar la vista del instructor de la del estudiante
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete, isInstructorView = false }) => {
  // Determina la URL de destino del enlace de la tarjeta
  const courseDetailUrl = isInstructorView
    ? `/dashboard/instructor/crear?id=${course.id}` // Para edición por el instructor
    : `/dashboard/cursos/${course.id}`; // Para vista de estudiante/público

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Enlace principal de la tarjeta */}
      <Link href={courseDetailUrl} className="block"> {/* Aplica estilos directamente al Link */}
        {course.imagenUrl ? (
          <Image
            src={course.imagenUrl}
            alt={course.titulo || 'Imagen del curso'}
            width={400}
            height={250}
            layout="responsive"
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{course.titulo || 'Curso sin título'}</h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">{course.descripcionCorta || 'Sin descripción corta.'}</p>
          <p className="text-sm font-semibold text-blue-600 mb-2">
            {course.publicado ? 'Publicado' : 'Borrador'}
          </p>
          <p className="text-lg font-bold text-green-600">
            {course.moneda} {course.precio !== undefined ? course.precio.toFixed(2) : '0.00'}
          </p>
        </div>
      </Link>
      {isInstructorView && ( // Mostrar botones de acción solo en la vista del instructor
        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={() => onEdit(course.id!)}
            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
            title="Editar Curso"
          >
            <FaEdit />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(course.id!)}
              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Eliminar Curso"
            >
              <FaTrash />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseCard;
