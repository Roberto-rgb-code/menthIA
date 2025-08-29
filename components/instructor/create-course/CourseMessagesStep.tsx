// components/instructor/create-course/CourseMessagesStep.tsx
import React from 'react';
import { Curso } from '../../../types/Curso'; // Asegúrate de que la ruta sea correcta

interface CourseMessagesStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CourseMessagesStep: React.FC<CourseMessagesStepProps> = ({ courseData, handleChange }) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Mensajes del Curso</h2>
      <p className="text-gray-700 mb-6">
        Crea mensajes automáticos para dar la bienvenida a los nuevos estudiantes y felicitarlos al finalizar el curso.
      </p>

      {/* Mensaje de Bienvenida */}
      <div className="mb-6">
        <label htmlFor="mensajeBienvenida" className="block text-lg font-medium text-gray-700 mb-2">
          Mensaje de Bienvenida
        </label>
        <textarea
          id="mensajeBienvenida"
          value={courseData.mensajeBienvenida || ''} // Asumiendo que añades 'mensajeBienvenida' a tu interfaz Curso
          onChange={(e) => handleChange('mensajeBienvenida', e.target.value)}
          rows={6}
          placeholder="Ej: ¡Hola! Te doy la bienvenida al curso de [Título del Curso]. Estoy emocionado de tenerte aquí y listo para ayudarte en tu camino de aprendizaje. Si tienes alguna pregunta, no dudes en contactarme."
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-y"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">
          Este mensaje se enviará automáticamente a los estudiantes cuando se inscriban en tu curso.
        </p>
      </div>

      {/* Mensaje de Felicidades */}
      <div className="mb-6">
        <label htmlFor="mensajeFelicidades" className="block text-lg font-medium text-gray-700 mb-2">
          Mensaje de Felicidades al Finalizar
        </label>
        <textarea
          id="mensajeFelicidades"
          value={courseData.mensajeFelicidades || ''} // Asumiendo que añades 'mensajeFelicidades' a tu interfaz Curso
          onChange={(e) => handleChange('mensajeFelicidades', e.target.value)}
          rows={6}
          placeholder="Ej: ¡Felicidades por completar el curso de [Título del Curso]! Estoy muy orgulloso de tu dedicación. Espero que hayas aprendido mucho y que puedas aplicar tus nuevas habilidades. ¡No dudes en dejar una reseña!"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 resize-y"
        ></textarea>
        <p className="text-sm text-gray-500 mt-1">
          Este mensaje se enviará automáticamente a los estudiantes cuando marquen el curso como completado.
        </p>
      </div>

      <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-800">
        <h3 className="font-semibold text-lg mb-2">Consejos para Mensajes Efectivos</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Sé cálido y acogedor en tu mensaje de bienvenida.</li>
          <li>Anima a los estudiantes a hacer preguntas y participar.</li>
          <li>En el mensaje de felicitación, recuérdales dejar una reseña y explorar otros cursos.</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseMessagesStep;