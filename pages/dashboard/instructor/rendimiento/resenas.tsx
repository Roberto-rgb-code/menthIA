// pages/dashboard/instructor/rendimiento/resenas.tsx
import React, { useState } from 'react';
import InstructorDashboardLayout from '@/components/layout/InstructorDashboardLayout'; // Asegúrate de que la ruta sea correcta
import { FaDownload, FaInfoCircle } from 'react-icons/fa';

const InstructorReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'insights'>('reviews');
  const [filterNoResponse, setFilterNoResponse] = useState(false);
  const [filterHasComment, setFilterHasComment] = useState(false);
  const [filterRating, setFilterRating] = useState('all'); // 'all', '5', '4', etc.
  const [filterOrder, setFilterOrder] = useState('recent'); // 'recent', 'oldest', etc.

  // En una aplicación real, aquí cargarías las reseñas basándote en los filtros y el ID del instructor.
  const reviews = []; // Array vacío para simular "No se han encontrado reseñas"

  return (
    <InstructorDashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reseñas</h1>
        {/* Aquí podrías tener un dropdown para "Todos los cursos" si tienes varios */}
        <div className="relative">
          <select className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option>Todos los cursos</option>
            {/* Agrega opciones de cursos dinámicamente si es necesario */}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reseñas
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Insights <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Nuevo</span>
          </button>
        </nav>
      </div>

      {activeTab === 'reviews' && (
        <>
          {/* Filtros y Exportar */}
          <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-white rounded-lg shadow-sm">
            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                checked={filterNoResponse}
                onChange={() => setFilterNoResponse(!filterNoResponse)}
              />
              <span className="ml-2">Sin respuesta ({0})</span> {/* Simula el contador */}
            </label>

            <label className="flex items-center text-sm text-gray-700">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
                checked={filterHasComment}
                onChange={() => setFilterHasComment(!filterHasComment)}
              />
              <span className="ml-2">Tiene un comentario</span>
            </label>

            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span>Calificación:</span>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="all">Todo</option>
                <option value="5">5 estrellas</option>
                <option value="4">4 estrellas</option>
                <option value="3">3 estrellas</option>
                <option value="2">2 estrellas</option>
                <option value="1">1 estrella</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span>Ordenar por:</span>
              <select
                value={filterOrder}
                onChange={(e) => setFilterOrder(e.target.value)}
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="recent">Primero los más recientes</option>
                <option value="oldest">Primero los más antiguos</option>
              </select>
            </div>

            <button className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md flex items-center hover:bg-blue-700 transition duration-300 shadow-sm text-sm">
              <FaDownload className="mr-2" /> Exportar a CSV...
            </button>
          </div>

          {/* Mensaje informativo */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg flex items-start shadow-sm">
            <FaInfoCircle className="mt-1 mr-3 text-blue-500 text-xl flex-shrink-0" />
            <p className="text-sm">
              Las calificaciones de los estudiantes aprobadas pueden tardar hasta 48 horas en mostrarse en tu página de inicio del curso.
            </p>
          </div>

          {/* Contenido de las reseñas */}
          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 text-lg">No se han encontrado reseñas</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Aquí iría el mapeo de las reseñas cuando haya datos */}
              {/* Ejemplo de una reseña (descomentar cuando tengas datos reales) */}
              {/*
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-gray-800">Título de la Reseña</h4>
                  <span className="text-yellow-500">★★★★★</span>
                </div>
                <p className="text-gray-700 text-sm mb-4">"Este es un comentario de ejemplo de una reseña."</p>
                <div className="text-xs text-gray-500">
                  <p>Por: Nombre del Estudiante</p>
                  <p>Curso: Título del Curso</p>
                  <p>Fecha: 27 de Julio de 2025</p>
                </div>
              </div>
              */}
            </div>
          )}
        </>
      )}

      {activeTab === 'insights' && (
        <div className="text-center py-10">
          <p className="text-gray-600 text-lg">Contenido de Insights (Nuevo) irá aquí.</p>
        </div>
      )}
    </InstructorDashboardLayout>
  );
};

export default InstructorReviewsPage;
