// components/courses/CourseForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { courseCategories } from '../../utils/categories';

interface CourseFormData {
  titulo: string;
  descripcionCorta: string;
  descripcionLarga: string;
  categoria: string;
  nivel: string;
  idioma: string;
  duracionEstimada: number;
  precio: number;
  moneda: string;
  imagenUrl: string;
  videoIntroduccionUrl: string;
  requisitos: string[];
  loQueAprenderas: string[];
}

const CourseForm: React.FC = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<CourseFormData>({
    titulo: '',
    descripcionCorta: '',
    descripcionLarga: '',
    categoria: '',
    nivel: 'Básico',
    idioma: 'Español',
    duracionEstimada: 0,
    precio: 0,
    moneda: 'MXN',
    imagenUrl: '',
    videoIntroduccionUrl: '',
    requisitos: [],
    loQueAprenderas: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleArrayChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: 'requisitos' | 'loQueAprenderas'
  ) => {
    const newArray = [...formData[field]];
    newArray[index] = e.target.value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addToArray = (field: 'requisitos' | 'loQueAprenderas') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeFromArray = (index: number, field: 'requisitos' | 'loQueAprenderas') => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!formData.categoria) {
      setError('Por favor, selecciona una categoría para el curso.');
      setLoading(false);
      return;
    }

    const instructorId = 'some-instructor-id'; // Reemplazar con el ID real del usuario autenticado
    const instructorNombre = 'Instructor Prueba'; // Reemplazar con el nombre real

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          instructorId,
          instructorNombre,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el curso');
      }

      const newCourse = await response.json();
      setSuccessMessage('Curso creado exitosamente!');
      console.log('Curso creado:', newCourse);
      router.push(`/dashboard/instructor/courses`);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado.');
      console.error('Error al crear el curso:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="titulo" className="block text-gray-700 text-sm font-bold mb-2">Título del Curso:</label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="descripcionCorta" className="block text-gray-700 text-sm font-bold mb-2">Descripción Corta:</label>
        <textarea
          id="descripcionCorta"
          name="descripcionCorta"
          value={formData.descripcionCorta}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-20"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="descripcionLarga" className="block text-gray-700 text-sm font-bold mb-2">Descripción Larga:</label>
        <textarea
          id="descripcionLarga"
          name="descripcionLarga"
          value={formData.descripcionLarga}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="categoria" className="block text-gray-700 text-sm font-bold mb-2">Categoría:</label>
        <select
          id="categoria"
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          required
        >
          <option value="" disabled>Elige una categoría</option>
          {courseCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="nivel" className="block text-gray-700 text-sm font-bold mb-2">Nivel:</label>
        <select
          id="nivel"
          name="nivel"
          value={formData.nivel}
          onChange={handleChange}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        >
          <option value="Básico">Básico</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="idioma" className="block text-gray-700 text-sm font-bold mb-2">Idioma:</label>
        <input
          type="text"
          id="idioma"
          name="idioma"
          value={formData.idioma}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="duracionEstimada" className="block text-gray-700 text-sm font-bold mb-2">Duración Estimada (horas):</label>
        <input
          type="number"
          id="duracionEstimada"
          name="duracionEstimada"
          value={formData.duracionEstimada}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4 flex space-x-4">
        <div className="w-1/2">
          <label htmlFor="precio" className="block text-gray-700 text-sm font-bold mb-2">Precio:</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="w-1/2">
          <label htmlFor="moneda" className="block text-gray-700 text-sm font-bold mb-2">Moneda:</label>
          <select
            id="moneda"
            name="moneda"
            value={formData.moneda}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="imagenUrl" className="block text-gray-700 text-sm font-bold mb-2">URL de Imagen (Miniatura):</label>
        <input
          type="url"
          id="imagenUrl"
          name="imagenUrl"
          value={formData.imagenUrl}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="videoIntroduccionUrl" className="block text-gray-700 text-sm font-bold mb-2">URL de Video Introductorio:</label>
        <input
          type="url"
          id="videoIntroduccionUrl"
          name="videoIntroduccionUrl"
          value={formData.videoIntroduccionUrl}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Requisitos:</label>
        {formData.requisitos.map((req, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={req}
              onChange={(e) => handleArrayChange(e, index, 'requisitos')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
            />
            <button
              type="button"
              onClick={() => removeFromArray(index, 'requisitos')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addToArray('requisitos')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          + Añadir Requisito
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">Lo que aprenderás:</label>
        {formData.loQueAprenderas.map((item, index) => (
          <div key={index} className="flex mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(e, index, 'loQueAprenderas')}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
            />
            <button
              type="button"
              onClick={() => removeFromArray(index, 'loQueAprenderas')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addToArray('loQueAprenderas')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          + Añadir Punto de Aprendizaje
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          disabled={loading}
        >
          {loading ? 'Creando...' : 'Crear Curso'}
        </button>
      </div>
    </form>
  );
};

export default CourseForm;
