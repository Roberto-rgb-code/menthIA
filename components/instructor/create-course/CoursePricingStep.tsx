// components/instructor/create-course/CoursePricingStep.tsx
import React from 'react';
import { Curso } from '../../../types/Curso'; // Asegúrate de que la ruta sea correcta

interface CoursePricingStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CoursePricingStep: React.FC<CoursePricingStepProps> = ({ courseData, handleChange }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Precios</h2>
      <p className="text-gray-700 mb-6">
        Establece el precio de tu curso. Considera el valor que ofreces y los precios de cursos similares.
      </p>

      {/* Precio del Curso */}
      <div className="mb-6">
        <label htmlFor="precio" className="block text-lg font-medium text-gray-700 mb-2">
          Precio del Curso
        </label>
        <div className="flex items-center">
          <select
            id="moneda"
            value={courseData.moneda || 'MXN'}
            onChange={(e) => handleChange('moneda', e.target.value)}
            className="p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-gray-50"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            {/* Puedes añadir más monedas si es necesario */}
          </select>
          <input
            type="number"
            id="precio"
            value={courseData.precio !== undefined ? courseData.precio : ''}
            onChange={(e) => handleChange('precio', parseFloat(e.target.value))}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="flex-grow p-3 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          El precio mínimo recomendado para cursos es de 99 MXN (o equivalente).
        </p>
      </div>

      {/* Información adicional sobre precios/descuentos */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
        <h3 className="font-semibold text-lg mb-2">Consideraciones de Precios</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Investiga los precios de cursos similares en la plataforma.</li>
          <li>Ofrece un precio competitivo pero que refleje el valor de tu contenido.</li>
          <li>Puedes ofrecer descuentos y promociones en el siguiente paso.</li>
        </ul>
      </div>
    </div>
  );
};

export default CoursePricingStep;