// components/instructor/create-course/CoursePlanningStep.tsx
import React from 'react';
import { Curso } from '@/types/Curso'; // Updated to use @ alias

interface CoursePlanningStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
  categories: string[]; // Lista de categorías disponibles
}

const CoursePlanningStep: React.FC<CoursePlanningStepProps> = ({
  courseData,
  handleChange,
  categories,
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Planifica tu curso</h2>
      <p className="text-gray-700 mb-8">
        Ayúdanos a comprender mejor tu curso. Esto nos permitirá ofrecerte los recursos que necesitas.
      </p>

      {/* Campo de Categoría */}
      <div className="mb-8">
        <label htmlFor="categoria" className="block text-xl font-semibold text-gray-800 mb-3">
          ¿Qué categoría se ajusta mejor a tu curso?
        </label>
        <select
          id="categoria"
          className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg rounded-md shadow-sm"
          value={courseData.categoria || ''}
          onChange={(e) => handleChange('categoria', e.target.value)}
        >
          <option value="">Elige una categoría</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {!courseData.categoria && (
          <p className="mt-2 text-sm text-red-600">Por favor, selecciona una categoría.</p>
        )}
      </div>

      {/* Campo de Nivel */}
      <div className="mb-8">
        <label htmlFor="nivel" className="block text-xl font-semibold text-gray-800 mb-3">
          ¿Cuál es el nivel de tu curso?
        </label>
        <select
          id="nivel"
          className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg rounded-md shadow-sm"
          value={courseData.nivel || 'Todos los niveles'}
          onChange={(e) => handleChange('nivel', e.target.value)}
        >
          <option value="Principiante">Principiante</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
          <option value="Todos los niveles">Todos los niveles</option>
        </select>
      </div>

      {/* Campo de Idioma */}
      <div className="mb-8">
        <label htmlFor="idioma" className="block text-xl font-semibold text-gray-800 mb-3">
          ¿En qué idioma se impartirá tu curso?
        </label>
        <select
          id="idioma"
          className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg rounded-md shadow-sm"
          value={courseData.idioma || 'Español'}
          onChange={(e) => handleChange('idioma', e.target.value)}
        >
          <option value="Español">Español</option>
          <option value="Inglés">Inglés</option>
          <option value="Portugués">Portugués</option>
          {/* Añade más idiomas según sea necesario */}
        </select>
      </div>

      {/* Campo de Cuánto tiempo puedes dedicar a crear tu curso (radio buttons) */}
      <div className="mb-8">
        <span className="block text-xl font-semibold text-gray-800 mb-3">
          ¿Cuánto tiempo puedes dedicar a crear tu curso por semana?
        </span>
        <p className="text-gray-600 mb-4">
          No hay respuesta incorrecta a esta pregunta. Podemos ayudarte a alcanzar tus objetivos incluso si no dispones de mucho tiempo.
        </p>
        <div className="space-y-4">
          <label className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
            <input
              type="radio"
              name="dedicacionTiempo"
              value="0-2 horas"
              checked={courseData.dedicacionTiempo === '0-2 horas'}
              onChange={() => handleChange('dedicacionTiempo', '0-2 horas')}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-3 text-lg text-gray-800">Estoy muy ocupado ahora mismo (0-2 horas)</span>
          </label>
          <label className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
            <input
              type="radio"
              name="dedicacionTiempo"
              value="2-4 horas"
              checked={courseData.dedicacionTiempo === '2-4 horas'}
              onChange={() => handleChange('dedicacionTiempo', '2-4 horas')}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-3 text-lg text-gray-800">Trabajaré de forma ocasional (2-4 horas)</span>
          </label>
          <label className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
            <input
              type="radio"
              name="dedicacionTiempo"
              value="más de 5 horas"
              checked={courseData.dedicacionTiempo === 'más de 5 horas'}
              onChange={() => handleChange('dedicacionTiempo', 'más de 5 horas')}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-3 text-lg text-gray-800">Soy muy flexible (más de 5 horas)</span>
          </label>
          <label className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-200">
            <input
              type="radio"
              name="dedicacionTiempo"
              value="Todavía no he decidido"
              checked={courseData.dedicacionTiempo === 'Todavía no he decidido'}
              onChange={() => handleChange('dedicacionTiempo', 'Todavía no he decidido')}
              className="form-radio h-5 w-5 text-blue-600"
            />
            <span className="ml-3 text-lg text-gray-800">Todavía no he decidido si tengo tiempo</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CoursePlanningStep;