// pages/dashboard/instructor/comunicacion/index.tsx
import React from 'react';
import InstructorDashboardLayout from '@/components/layout/InstructorDashboardLayout';
import { FaInbox } from 'react-icons/fa';
import Link from 'next/link'; // Importa Link

const InstructorCommunicationPage: React.FC = () => {
  return (
    <InstructorDashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Preguntas y respuestas</h1>
        <p className="text-gray-600 mt-2">Gestiona la comunicación con tus estudiantes.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" />
            <span className="ml-2">Sin leer (0)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" />
            <span className="ml-2">No hay una mejor respuesta (0)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" />
            <span className="ml-2">Sin respuestas (0)</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600 rounded" />
            <span className="ml-2">No hay respuesta del instructor (0)</span>
          </label>
          <div className="flex items-center ml-auto">
            <span className="mr-2">Ordenar por:</span>
            <select className="p-2 border border-gray-300 rounded-md text-sm">
              <option>Primero los más recientes</option>
            </select>
          </div>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center">
            <FaInbox className="text-lg" />
          </button>
          <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center justify-center">
            <span className="text-lg">☰</span>
          </button>
        </div>
        <div className="flex items-center mt-4">
          <h4 className="font-semibold text-blue-700 mr-4">Q&A</h4>
          <h4 className="text-gray-500">Insights <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Nuevo</span></h4>
        </div>
      </div>

      <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
        <img src="/images/no-questions.svg" alt="No hay preguntas" className="mx-auto mb-8 w-40 h-40 object-contain" />
        <p className="text-gray-600 text-lg max-w-lg mx-auto leading-relaxed">
          La sección Preguntas y respuestas es un foro en el que tus estudiantes pueden hacer preguntas, recibir tus respuestas y responderse entre sí. Aquí es donde verás las conversaciones de la sección Preguntas y respuestas de tus cursos.
        </p>
      </div>

      <div className="mt-12 p-6 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg shadow-sm">
        <h3 className="font-bold text-lg mb-2">Información detallada sobre AI Assistant <span className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">Nuevo</span></h3>
        <p className="text-sm">
          (Contenido sobre el asistente de IA para comunicación si aplica).
        </p>
      </div>
    </InstructorDashboardLayout>
  );
};

export default InstructorCommunicationPage;
