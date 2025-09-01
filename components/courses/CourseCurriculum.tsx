// components/instructor/create-course/CourseCurriculumStep.tsx
import React from 'react';
import { Curso, Seccion } from '@/types/Curso';

interface CourseCurriculumStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CourseCurriculumStep: React.FC<CourseCurriculumStepProps> = ({ courseData, handleChange }) => {
  const secciones = courseData.secciones || [];

  const addSection = () => {
    const newSection: Seccion = {
      id: `section-${Date.now()}`,
      titulo: '',
      orden: secciones.length + 1,
      lecciones: [],
    };
    handleChange('secciones', [...secciones, newSection]);
  };

  const updateSectionTitle = (index: number, title: string) => {
    const updatedSecciones = [...secciones];
    updatedSecciones[index].titulo = title;
    handleChange('secciones', updatedSecciones);
  };

  const addLesson = (sectionIndex: number) => {
    const updatedSecciones = [...secciones];
    const section = updatedSecciones[sectionIndex];
    if (section) {
      const newLesson = {
        id: `lesson-${Date.now()}`,
        titulo: '',
        tipo: 'video',
        contenidoUrl: '',
        duracion: 0,
        orden: section.lecciones.length + 1,
      };
      section.lecciones.push(newLesson);
      handleChange('secciones', updatedSecciones);
    }
  };

  const updateLessonTitle = (sectionIndex: number, lessonIndex: number, title: string) => {
    const updatedSecciones = [...secciones];
    const section = updatedSecciones[sectionIndex];
    if (section && section.lecciones[lessonIndex]) {
      section.lecciones[lessonIndex].titulo = title;
      handleChange('secciones', updatedSecciones);
    }
  };

  const removeSection = (index: number) => {
    const updatedSecciones = secciones.filter((_, i) => i !== index);
    const reorderedSecciones = updatedSecciones.map((sec, i) => ({
      ...sec,
      orden: i + 1,
    }));
    handleChange('secciones', reorderedSecciones);
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    const updatedSecciones = [...secciones];
    const section = updatedSecciones[sectionIndex];
    if (section) {
      section.lecciones = section.lecciones.filter((_, i) => i !== lessonIndex);
      section.lecciones = section.lecciones.map((leccion, i) => ({
        ...leccion,
        orden: i + 1,
      }));
      handleChange('secciones', updatedSecciones);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Estructura del curso</h2>
      <p className="text-gray-700 mb-4">Organiza tu contenido en secciones y lecciones.</p>

      <button
        onClick={addSection}
        className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <span className="text-xl mr-2">+</span> Añadir Nueva Sección
      </button>

      {secciones.length === 0 && (
        <p className="text-gray-500 italic mb-4">
          Aún no has añadido ninguna sección. Haz clic en el botón de arriba para empezar.
        </p>
      )}

      {secciones.map((section, sectionIndex) => (
        <div key={section.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-semibold text-gray-800">Sección {section.orden}</h3>
            <button
              onClick={() => removeSection(sectionIndex)}
              className="text-red-500 hover:text-red-700 text-sm font-semibold"
            >
              Eliminar Sección
            </button>
          </div>
          <input
            type="text"
            placeholder="Título de la sección (Ej: Introducción al Machine Learning)"
            value={section.titulo}
            onChange={(e) => updateSectionTitle(sectionIndex, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          />

          <h4 className="text-lg font-medium text-gray-700 mb-3 ml-2">Lecciones:</h4>
          {section.lecciones.length === 0 && (
            <p className="text-gray-500 italic ml-4 mb-3">Esta sección no tiene lecciones aún.</p>
          )}
          <ul className="space-y-2 ml-4">
            {section.lecciones.map((lesson, lessonIndex) => (
              <li
                key={lesson.id}
                className="flex items-center space-x-2 bg-white p-3 border border-gray-200 rounded-md"
              >
                <span className="text-gray-600 font-medium mr-2">
                  {sectionIndex + 1}.{lesson.orden}
                </span>
                <input
                  type="text"
                  placeholder="Título de la lección"
                  value={lesson.titulo}
                  onChange={(e) => updateLessonTitle(sectionIndex, lessonIndex, e.target.value)}
                  className="flex-grow p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                />
                <button
                  onClick={() => removeLesson(sectionIndex, lessonIndex)}
                  className="text-red-400 hover:text-red-600 text-xs"
                >
                  X
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => addLesson(sectionIndex)}
            className="mt-4 flex items-center text-blue-500 hover:text-blue-700 text-sm font-semibold px-3 py-1 rounded-md border border-blue-400 hover:border-blue-600 transition-colors"
          >
            <span className="text-lg mr-1">+</span> Añadir Lección
          </button>
        </div>
      ))}
    </div>
  );
};

export default CourseCurriculumStep;
