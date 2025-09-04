// components/instructor/create-course/CourseObjectivesStep.tsx
import React from 'react';
import { Curso } from '@/types/Curso'; // Use @ alias for consistent import
import { FaPlus, FaTrash } from 'react-icons/fa';

interface CourseObjectivesStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CourseObjectivesStep: React.FC<CourseObjectivesStepProps> = ({
  courseData,
  handleChange,
}) => {
  // Maneja cambios en los arrays de requisitos o loQueAprenderas
  const handleArrayChange = (
    arrayName: 'requisitos' | 'loQueAprenderas',
    index: number,
    value: string
  ) => {
    const newArray = [...(courseData[arrayName] || [''])]; // Asegura que sea un array
    newArray[index] = value;
    handleChange(arrayName, newArray);
  };

  // Añade un nuevo elemento al array
  const addArrayItem = (arrayName: 'requisitos' | 'loQueAprenderas') => {
    handleChange(arrayName, [...(courseData[arrayName] || []), '']);
  };

  // Elimina un elemento del array
  const removeArrayItem = (
    arrayName: 'requisitos' | 'loQueAprenderas',
    index: number
  ) => {
    const newArray = (courseData[arrayName] || []).filter((_, i) => i !== index);
    handleChange(arrayName, newArray);
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Estudiantes objetivo</h2>
      <p className="text-gray-700 mb-8">
        Las siguientes descripciones estarán visibles públicamente en la **página de inicio de tu curso** y afectarán directamente al rendimiento de tu curso. Dichas descripciones permitirán a los estudiantes saber si el curso es adecuado para ellos.
      </p>

      {/* Lo que aprenderán los estudiantes */}
      <div className="mb-8">
        <label className="block text-xl font-semibold text-gray-800 mb-3">
          ¿Qué aprenderán los estudiantes en tu curso?
        </label>
        <p className="text-gray-600 mb-4">
          Debes escribir, al menos, 4 **objetivos de aprendizaje o resultados** que los estudiantes esperen conseguir al finalizar el curso.
        </p>
        {(courseData.loQueAprenderas || ['']).map((item, index) => (
          <div key={index} className="flex items-center mb-3">
            <input
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 mr-2"
              placeholder={`Ejemplo: Definición de las funciones y responsabilidades de un gestor de proyectos. (Objetivo ${index + 1})`}
              value={item}
              onChange={(e) => handleArrayChange('loQueAprenderas', index, e.target.value)}
            />
            {courseData.loQueAprenderas && courseData.loQueAprenderas.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('loQueAprenderas', index)}
                className="p-3 text-red-600 hover:text-red-800 transition-colors"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('loQueAprenderas')}
          className="mt-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Añadir otro objetivo
        </button>
        {courseData.loQueAprenderas && courseData.loQueAprenderas.filter(Boolean).length < 4 && (
          <p className="mt-2 text-sm text-red-600">Necesitas al menos 4 objetivos.</p>
        )}
      </div>

      {/* Requisitos */}
      <div className="mb-8">
        <label className="block text-xl font-semibold text-gray-800 mb-3">
          ¿Cuáles son los requisitos o prerrequisitos para apuntarse a tu curso?
        </label>
        <p className="text-gray-600 mb-4">
          Enumera las herramientas, habilidades o conocimientos previos que los estudiantes deberían tener.
        </p>
        {(courseData.requisitos || ['']).map((item, index) => (
          <div key={index} className="flex items-center mb-3">
            <input
              type="text"
              className="flex-grow p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800 mr-2"
              placeholder={`Ejemplo: No se requiere experiencia previa en programación. (Requisito ${index + 1})`}
              value={item}
              onChange={(e) => handleArrayChange('requisitos', index, e.target.value)}
            />
            {courseData.requisitos && courseData.requisitos.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('requisitos', index)}
                className="p-3 text-red-600 hover:text-red-800 transition-colors"
              >
                <FaTrash />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('requisitos')}
          className="mt-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center"
        >
          <FaPlus className="mr-2" /> Añadir otro requisito
        </button>
      </div>

      {/* Para quién es este curso */}
      <div>
        <label htmlFor="publicoObjetivo" className="block text-xl font-semibold text-gray-800 mb-3">
          ¿Para quién es este curso?
        </label>
        <p className="text-gray-600 mb-4">
          Describe al estudiante ideal de tu curso.
        </p>
        <textarea
          id="publicoObjetivo"
          className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
          rows={4}
          placeholder="Ejemplo: Este curso está diseñado para desarrolladores frontend que deseen mejorar sus habilidades en React y aprender a construir aplicaciones escalables..."
          value={courseData.publicoObjetivo || ''} // Asumiendo que añades publicoObjetivo a tu interfaz Curso
          onChange={(e) => handleChange('publicoObjetivo', e.target.value)}
        ></textarea>
      </div>
    </div>
  );
};

export default CourseObjectivesStep;