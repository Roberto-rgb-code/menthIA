// components/forms/CourseForm.tsx
import React, { useState, useEffect } from 'react';
import { Curso } from '../../types/Curso'; // Asegúrate de que esta ruta sea correcta
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify'; // Para notificaciones (asegúrate de tener react-toastify instalado)
import { useRouter } from 'next/router';
import { FaUpload, FaSpinner } from 'react-icons/fa'; // Iconos para la subida
import Image from 'next/image'; // Componente de imagen de Next.js

// Si aún no tienes react-toastify, instálalo:
// npm install react-toastify
// npm install --save-dev @types/react-toastify

interface CourseFormProps {
  courseId?: string; // Opcional, si estamos editando un curso existente
}

// Tipo para los datos del formulario, que coincidirá con Curso pero algunas propiedades pueden ser File
interface CourseFormData {
  titulo: string;
  slug: string;
  descripcionCorta: string;
  descripcionLarga: string;
  categoria: string;
  subcategoria?: string;
  idioma: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'todos';
  precio: number;
  moneda: string;
  duracionEstimada: number; // En horas
  imagenFile?: FileList; // Para la subida del archivo de imagen
  imagenUrl?: string; // Para mostrar la URL existente o la previsualización
  videoIntroduccionFile?: FileList; // Para la subida del archivo de video
  videoIntroduccionUrl?: string; // Para mostrar la URL existente o la previsualización
  publicado: boolean;
  requisitos: string; // Se manejará como string y se convertirá a array
  loQueAprenderas: string; // Se manejará como string y se convertirá a array
  instructorId: string; // Este campo podría ser llenado por el backend o el contexto de usuario
  instructorNombre: string; // Este campo podría ser llenado por el backend o el contexto de usuario
}

const CourseForm: React.FC<CourseFormProps> = ({ courseId }) => {
  const router = useRouter();
  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<CourseFormData>();

  const [loadingCourse, setLoadingCourse] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  // Watch para previsualización de imagen y video
  const watchedImageFile = watch('imagenFile');
  const watchedVideoFile = watch('videoIntroduccionFile');

  useEffect(() => {
    // Lógica para previsualizar la imagen seleccionada
    if (watchedImageFile && watchedImageFile.length > 0) {
      const file = watchedImageFile[0];
      setImagePreviewUrl(URL.createObjectURL(file));
      return () => URL.revokeObjectURL(file.name); // Limpiar URL al desmontar
    } else if (!courseId) { // Si es un nuevo curso y no hay archivo, limpiar la previsualización
      setImagePreviewUrl(null);
    }
  }, [watchedImageFile, courseId]);

  useEffect(() => {
    // Lógica para previsualizar el video seleccionado
    if (watchedVideoFile && watchedVideoFile.length > 0) {
      const file = watchedVideoFile[0];
      setVideoPreviewUrl(URL.createObjectURL(file));
      return () => URL.revokeObjectURL(file.name); // Limpiar URL al desmontar
    } else if (!courseId) { // Si es un nuevo curso y no hay archivo, limpiar la previsualización
      setVideoPreviewUrl(null);
    }
  }, [watchedVideoFile, courseId]);

  // Lógica para cargar el curso si estamos en modo edición (courseId existe)
  useEffect(() => {
    const fetchCourse = async () => {
      if (courseId) {
        setLoadingCourse(true);
        try {
          const response = await fetch(`/api/courses/${courseId}`);
          if (!response.ok) {
            throw new Error('No se pudo cargar el curso');
          }
          const courseData: Curso = await response.json();

          // Rellenar el formulario con los datos del curso
          for (const key in courseData) {
            if (Object.prototype.hasOwnProperty.call(courseData, key)) {
              const value = courseData[key as keyof Curso];
              if (key === 'requisitos' || key === 'loQueAprenderas') {
                setValue(key as 'requisitos' | 'loQueAprenderas', (value as string[]).join('\n'));
              } else if (key === 'imagenUrl') {
                setImagePreviewUrl(value as string); // Establecer la URL existente para previsualización
                setValue('imagenUrl', value as string); // También establecer el valor en el formulario
              } else if (key === 'videoIntroduccionUrl') {
                setVideoPreviewUrl(value as string); // Establecer la URL existente para previsualización
                setValue('videoIntroduccionUrl', value as string);
              } else {
                setValue(key as keyof CourseFormData, value as any);
              }
            }
          }
          toast.success('Curso cargado para edición.');
        } catch (error: any) {
          console.error("Error loading course:", error);
          toast.error(`Error al cargar el curso: ${error.message}`);
          router.push('/dashboard/instructor'); // Redirigir si el curso no se encuentra
        } finally {
          setLoadingCourse(false);
        }
      }
    };
    fetchCourse();
  }, [courseId, router, setValue]); // Dependencias para useEffect

  const onSubmit = async (data: CourseFormData) => {
    let finalImageUrl = data.imagenUrl; // Usar URL existente si no se sube nueva
    let finalVideoUrl = data.videoIntroduccionUrl; // Usar URL existente si no se sube nuevo

    try {
      // 1. Subir la imagen del curso a S3 si se seleccionó un nuevo archivo
      if (data.imagenFile && data.imagenFile.length > 0) {
        const imageFile = data.imagenFile[0];
        const imageUploadRes = await uploadFileToS3(imageFile, 'course-images');
        if (imageUploadRes.error) {
          throw new Error(imageUploadRes.error);
        }
        finalImageUrl = imageUploadRes.url;
      }

      // 2. Subir el video de introducción a S3 si se seleccionó un nuevo archivo
      if (data.videoIntroduccionFile && data.videoIntroduccionFile.length > 0) {
        const videoFile = data.videoIntroduccionFile[0];
        const videoUploadRes = await uploadFileToS3(videoFile, 'course-videos');
        if (videoUploadRes.error) {
          throw new Error(videoUploadRes.error);
        }
        finalVideoUrl = videoUploadRes.url;
      }

      // Preparar los datos para enviar a la API
      const coursePayload: Omit<Curso, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'calificacionPromedio' | 'numeroCalificaciones'> = {
        titulo: data.titulo,
        slug: data.slug,
        descripcionCorta: data.descripcionCorta,
        descripcionLarga: data.descripcionLarga,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        idioma: data.idioma,
        nivel: data.nivel,
        precio: data.precio,
        moneda: data.moneda,
        duracionEstimada: data.duracionEstimada,
        imagenUrl: finalImageUrl || '', // Asegúrate de que no sea undefined
        videoIntroduccionUrl: finalVideoUrl,
        instructorId: data.instructorId, // Asegúrate de que esto se obtenga de forma segura
        instructorNombre: data.instructorNombre, // Asegúrate de que esto se obtenga de forma segura
        publicado: data.publicado,
        requisitos: data.requisitos.split('\n').map(item => item.trim()).filter(item => item.length > 0),
        loQueAprenderas: data.loQueAprenderas.split('\n').map(item => item.trim()).filter(item => item.length > 0),
        secciones: [], // Las secciones se gestionarán por separado
      };

      let response;
      if (courseId) {
        // Modo edición (PUT)
        response = await fetch(`/api/courses/${courseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursePayload),
        });
      } else {
        // Modo creación (POST)
        response = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursePayload),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la operación del curso.');
      }

      const result = await response.json();
      toast.success(result.message);
      if (!courseId) {
        // Si es un nuevo curso, redirigir a la página de edición o a una lista
        router.push(`/dashboard/instructor/editar/${result.id}`);
      }

    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Función para obtener URL pre-firmada y subir archivo a S3
  const uploadFileToS3 = async (file: File, folder: string) => {
    try {
      // 1. Obtener URL pre-firmada de tu API
      const getSignedUrlRes = await fetch('/api/s3/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: folder, // 'course-images' o 'course-videos'
        }),
      });

      if (!getSignedUrlRes.ok) {
        const errorData = await getSignedUrlRes.json();
        throw new Error(errorData.message || 'Error al obtener la URL pre-firmada.');
      }

      const { url, key } = await getSignedUrlRes.json();

      // 2. Subir el archivo directamente a S3 usando la URL pre-firmada
      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error('Error al subir el archivo a S3.');
      }

      // La URL pública del archivo subido
      const publicUrl = url.split('?')[0]; // Eliminar los parámetros de la URL pre-firmada

      return { url: publicUrl, error: null };
    } catch (error: any) {
      console.error("Error uploading file to S3:", error);
      return { url: null, error: error.message || 'Fallo la subida del archivo.' };
    }
  };


  if (loadingCourse) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="ml-3 text-lg">Cargando curso...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{courseId ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>

      {/* Título del Curso */}
      <div>
        <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">Título del Curso</label>
        <input
          type="text"
          id="titulo"
          {...register('titulo', { required: 'El título es obligatorio' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>}
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL amigable)</label>
        <input
          type="text"
          id="slug"
          {...register('slug', { required: 'El slug es obligatorio' })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="ej: mi-curso-de-programacion"
        />
        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
      </div>

      {/* Descripción Corta */}
      <div>
        <label htmlFor="descripcionCorta" className="block text-sm font-medium text-gray-700">Descripción Corta</label>
        <textarea
          id="descripcionCorta"
          {...register('descripcionCorta', { required: 'La descripción corta es obligatoria' })}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Un resumen breve y atractivo del curso."
        ></textarea>
        {errors.descripcionCorta && <p className="mt-1 text-sm text-red-600">{errors.descripcionCorta.message}</p>}
      </div>

      {/* Descripción Larga */}
      <div>
        <label htmlFor="descripcionLarga" className="block text-sm font-medium text-gray-700">Descripción Larga</label>
        <textarea
          id="descripcionLarga"
          {...register('descripcionLarga', { required: 'La descripción larga es obligatoria' })}
          rows={6}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Detalles completos sobre qué trata el curso, a quién va dirigido, etc."
        ></textarea>
        {errors.descripcionLarga && <p className="mt-1 text-sm text-red-600">{errors.descripcionLarga.message}</p>}
      </div>

      {/* Categoría e Idioma (Selects) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">Categoría</label>
          <select
            id="categoria"
            {...register('categoria', { required: 'La categoría es obligatoria' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona una categoría</option>
            <option value="desarrollo">Desarrollo</option>
            <option value="diseno">Diseño</option>
            <option value="negocios">Negocios</option>
            <option value="marketing">Marketing</option>
            {/* Agrega más categorías según necesites */}
          </select>
          {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>}
        </div>
        <div>
          <label htmlFor="idioma" className="block text-sm font-medium text-gray-700">Idioma</label>
          <select
            id="idioma"
            {...register('idioma', { required: 'El idioma es obligatorio' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona un idioma</option>
            <option value="espanol">Español</option>
            <option value="ingles">Inglés</option>
            {/* Agrega más idiomas */}
          </select>
          {errors.idioma && <p className="mt-1 text-sm text-red-600">{errors.idioma.message}</p>}
        </div>
      </div>

      {/* Nivel y Duración Estimada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nivel" className="block text-sm font-medium text-gray-700">Nivel</label>
          <select
            id="nivel"
            {...register('nivel', { required: 'El nivel es obligatorio' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona el nivel</option>
            <option value="principiante">Principiante</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzado">Avanzado</option>
            <option value="todos">Todos los niveles</option>
          </select>
          {errors.nivel && <p className="mt-1 text-sm text-red-600">{errors.nivel.message}</p>}
        </div>
        <div>
          <label htmlFor="duracionEstimada" className="block text-sm font-medium text-gray-700">Duración Estimada (horas)</label>
          <input
            type="number"
            id="duracionEstimada"
            {...register('duracionEstimada', { required: 'La duración es obligatoria', min: 0.1 })}
            step="0.1"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.duracionEstimada && <p className="mt-1 text-sm text-red-600">{errors.duracionEstimada.message}</p>}
        </div>
      </div>

      {/* Precio y Moneda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="precio" className="block text-sm font-medium text-gray-700">Precio</label>
          <input
            type="number"
            id="precio"
            {...register('precio', { required: 'El precio es obligatorio', min: 0 })}
            step="0.01"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio.message}</p>}
        </div>
        <div>
          <label htmlFor="moneda" className="block text-sm font-medium text-gray-700">Moneda</label>
          <select
            id="moneda"
            {...register('moneda', { required: 'La moneda es obligatoria' })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Selecciona la moneda</option>
            <option value="MXN">MXN (Pesos Mexicanos)</option>
            <option value="USD">USD (Dólares Americanos)</option>
            <option value="EUR">EUR (Euros)</option>
          </select>
          {errors.moneda && <p className="mt-1 text-sm text-red-600">{errors.moneda.message}</p>}
        </div>
      </div>

      {/* Imagen del Curso */}
      <div>
        <label htmlFor="imagenFile" className="block text-sm font-medium text-gray-700">Imagen de Portada del Curso</label>
        <div className="mt-1 flex items-center space-x-4">
          <input
            type="file"
            id="imagenFile"
            {...register('imagenFile')} // No requerido si ya hay una URL
            accept="image/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {imagePreviewUrl && (
            <div className="relative w-24 h-24 flex-shrink-0">
              <Image
                src={imagePreviewUrl}
                alt="Previsualización de imagen del curso"
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
          )}
        </div>
        {errors.imagenFile && <p className="mt-1 text-sm text-red-600">{errors.imagenFile.message}</p>}
        {!imagePreviewUrl && !courseId && (
          <p className="mt-1 text-sm text-gray-500">Se requiere una imagen para nuevos cursos.</p>
        )}
      </div>

      {/* Video de Introducción (Opcional) */}
      <div>
        <label htmlFor="videoIntroduccionFile" className="block text-sm font-medium text-gray-700">Video de Introducción (Opcional)</label>
        <div className="mt-1 flex items-center space-x-4">
          <input
            type="file"
            id="videoIntroduccionFile"
            {...register('videoIntroduccionFile')}
            accept="video/*"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-green-50 file:text-green-700
              hover:file:bg-green-100"
          />
          {videoPreviewUrl && (
            <div className="relative w-48 h-28 flex-shrink-0 bg-black rounded-md overflow-hidden">
              <video src={videoPreviewUrl} controls className="w-full h-full object-cover">
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          )}
        </div>
        {errors.videoIntroduccionFile && <p className="mt-1 text-sm text-red-600">{errors.videoIntroduccionFile.message}</p>}
      </div>

      {/* Requisitos (TextArea) */}
      <div>
        <label htmlFor="requisitos" className="block text-sm font-medium text-gray-700">Requisitos (uno por línea)</label>
        <textarea
          id="requisitos"
          {...register('requisitos')}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej:&#10;- Conocer los fundamentos de HTML&#10;- Tener un editor de código instalado"
        ></textarea>
      </div>

      {/* Lo Que Aprenderás (TextArea) */}
      <div>
        <label htmlFor="loQueAprenderas" className="block text-sm font-medium text-gray-700">Lo que Aprenderás (uno por línea)</label>
        <textarea
          id="loQueAprenderas"
          {...register('loQueAprenderas')}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ej:&#10;- Crear un sitio web responsive&#10;- Publicar tu proyecto en línea"
        ></textarea>
      </div>

      {/* Campo Instructor ID y Nombre (Ocultos o auto-llenados) */}
      {/*
        Estos campos DEBEN ser gestionados de forma segura en una aplicación real.
        Idealmente, se obtienen del contexto de autenticación del usuario logeado
        o se rellenan en la API Route.
        Por ahora, los dejamos como inputs ocultos o para desarrollo,
        pero considera cómo los rellenarás de forma segura.
      */}
      <input type="hidden" {...register('instructorId', { required: true })} value="TU_INSTRUCTOR_ID_FIJO_O_DINAMICO" />
      <input type="hidden" {...register('instructorNombre', { required: true })} value="Tu Nombre de Instructor" />


      {/* Checkbox Publicado */}
      <div className="flex items-center">
        <input
          id="publicado"
          type="checkbox"
          {...register('publicado')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="publicado" className="ml-2 block text-sm text-gray-900">
          Publicar curso (hacerlo visible públicamente)
        </label>
      </div>

      {/* Botón de Enviar */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <FaSpinner className="animate-spin mr-2" />
        ) : (
          <FaUpload className="mr-2" />
        )}
        {courseId ? 'Guardar Cambios' : 'Crear Curso'}
      </button>

      {/* Mostrar errores generales del formulario */}
      {Object.keys(errors).length > 0 && (
        <div className="p-3 mt-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
          Por favor, corrige los errores en el formulario.
        </div>
      )}
    </form>
  );
};

export default CourseForm;