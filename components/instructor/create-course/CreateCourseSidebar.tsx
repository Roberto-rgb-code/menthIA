// components/instructor/create-course/CreateCourseSidebar.tsx
import React from 'react';
import Link from 'next/link';
import { FaCheckCircle, FaCircle, FaPencilAlt } from 'react-icons/fa';

interface CreateCourseSidebarProps {
  steps: string[]; // Nombres de los pasos
  currentStepIndex: number; // Índice del paso actual
  onSelectStep: (index: number) => void; // Función para cambiar de paso
  courseId: string | null; // ID del curso si estamos en modo edición
}

const CreateCourseSidebar: React.FC<CreateCourseSidebarProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  courseId,
}) => {
  return (
    // Este div es el sidebar en sí mismo, no un layout completo.
    // Su ancho y estilo lo hacen parecer una barra lateral independiente.
    <div className="w-64 bg-gray-800 text-white p-6 flex flex-col justify-between flex-shrink-0 shadow-lg">
      <div>
        <div className="flex items-center mb-8">
          {/* Aquí iría el logo o nombre de tu aplicación, "MentorApp", si lo deseas */}
          {/* Para este contexto, lo dejaremos simple o sin texto si solo quieres el icono */}
          <Link href="/dashboard" className="flex items-center text-white text-2xl font-bold">
            {/* Puedes usar un icono de libro, o tu logo de MentorApp aquí */}
            {/* <FaBookOpen className="mr-2 text-blue-400" /> */}
            MentorApp
          </Link>
        </div>

        <h2 className="text-xl font-bold mb-6 text-gray-300">Plan de Curso</h2>

        <nav>
          <ul>
            {steps.map((step, index) => (
              <li key={index} className="mb-4">
                <button
                  onClick={() => onSelectStep(index)}
                  className={`w-full text-left py-2 px-3 rounded-lg flex items-center transition-all duration-200
                    ${index === currentStepIndex
                      ? 'bg-blue-600 text-white font-semibold shadow-md'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                    ${index < currentStepIndex && 'text-green-300 hover:text-white'}
                  `}
                >
                  <span className="mr-3 text-lg">
                    {index < currentStepIndex ? (
                      <FaCheckCircle className="text-green-400" />
                    ) : index === currentStepIndex ? (
                      <FaPencilAlt className="text-blue-400" />
                    ) : (
                      <FaCircle className="text-gray-500 text-sm" />
                    )}
                  </span>
                  {step}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Enlaces de borrador/vista previa si el curso ya tiene un ID */}
      {courseId && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <Link href={`/dashboard/instructor/cursos/${courseId}/gestion`} className="block w-full text-center py-2 px-3 rounded-lg text-blue-400 hover:bg-gray-700 transition-colors">
            Gestionar Borrador
          </Link>
          <Link href={`/cursos/${courseId}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center mt-2 py-2 px-3 rounded-lg text-green-400 hover:bg-gray-700 transition-colors">
            Vista Previa del Curso
          </Link>
        </div>
      )}
    </div>
  );
};

export default CreateCourseSidebar;