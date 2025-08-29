// components/instructor/create-course/CoursePromotionsStep.tsx
import React from 'react';
import { Curso } from '../../../types/Curso'; // Asegúrate de que la ruta sea correcta

interface CoursePromotionsStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CoursePromotionsStep: React.FC<CoursePromotionsStepProps> = ({ courseData, handleChange }) => {
  // Los datos de promociones (cupones, descuentos, etc.)
  // generalmente se manejan en una tabla o sub-colección separada
  // asociada al curso. Aquí solo pondremos un placeholder o
  // algunas opciones básicas si no quieres una gestión de cupones completa en este formulario.

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Promociones (Opcional)</h2>
      <p className="text-gray-700 mb-6">
        Atrae a más estudiantes ofreciendo descuentos o creando cupones promocionales.
      </p>

      <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Gestión de Cupones</h3>
        <p className="text-gray-600 mb-4">
          La gestión avanzada de cupones y ofertas específicas se realizará en una sección de marketing separada una vez que el curso esté publicado.
          Aquí puedes definir estrategias generales.
        </p>

        {/* Ejemplo de campo para una promoción inicial simple */}
        <label htmlFor="descuentoInicial" className="block text-lg font-medium text-gray-700 mb-2">
          Descuento de lanzamiento (Ej. 20% OFF)
        </label>
        <input
          type="text" // Podrías usar 'number' y un selector de '%'
          id="descuentoInicial"
          value={courseData.descuentoInicial || ''} // Asumiendo que añades 'descuentoInicial' a tu interfaz Curso
          onChange={(e) => handleChange('descuentoInicial', e.target.value)}
          placeholder="Ej: 20% de descuento o código: BIENVENIDA"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
        />
        <p className="text-sm text-gray-500 mt-1">
          Una breve descripción de una promoción inicial que planeas ofrecer.
        </p>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
        <h3 className="font-semibold text-lg mb-2">Próximos Pasos para Marketing</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Después de publicar, podrás acceder a herramientas de cupones y promociones desde el panel de control.</li>
          <li>Crea cupones con diferentes porcentajes de descuento y fechas de caducidad.</li>
          <li>Configura ofertas especiales para tu audiencia.</li>
        </ul>
      </div>
    </div>
  );
};

export default CoursePromotionsStep;