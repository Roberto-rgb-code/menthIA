// components/instructor/create-course/CourseLandingPageStep.tsx
import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Curso } from '@/types/Curso';
import { FaUpload, FaSpinner, FaFileImage } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface CourseLandingPageStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CourseLandingPageStep: React.FC<CourseLandingPageStepProps> = ({ courseData, handleChange }) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ percentage: number; uploadedMb: number; totalMb: number } | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    setCurrentFileName(file.name);
    setUploadProgress({ percentage: 0, uploadedMb: 0, totalMb: file.size / (1024 * 1024) });

    try {
      setUploadingImage(true);

      // 1. Obtener la URL pre-firmada de tu backend
      const getPresignedUrlResponse = await fetch('/api/generate-presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!getPresignedUrlResponse.ok) {
        const errorData = await getPresignedUrlResponse.json();
        throw new Error(errorData.message || 'Error al obtener la URL pre-firmada para la imagen.');
      }

      const { presignedUrl, publicFileUrl } = await getPresignedUrlResponse.json();

      // 2. Subir la imagen directamente a S3 usando la URL pre-firmada con XMLHttpRequest para progreso
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentage = (event.loaded / event.total) * 100;
          const uploadedMb = event.loaded / (1024 * 1024);
          const totalMb = event.total / (1024 * 1024);
          setUploadProgress({ percentage: parseFloat(percentage.toFixed(2)), uploadedMb: parseFloat(uploadedMb.toFixed(2)), totalMb: parseFloat(totalMb.toFixed(2)) });
        }
      };

      const uploadPromise = new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Error al subir la imagen a S3. Estado: ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Error de red al subir la imagen.'));
        xhr.onabort = () => reject(new Error('Subida de imagen cancelada.'));
      });

      xhr.send(file);
      await uploadPromise;

      handleChange('imagenUrl', publicFileUrl);
      toast.success('Imagen de portada subida exitosamente!');

    } catch (error: any) {
      console.error('Error durante la subida de imagen:', error);
      toast.error(error.message || 'Error al subir la imagen. Inténtalo de nuevo.');
    } finally {
      setUploadingImage(false);
      setUploadProgress(null);
      setCurrentFileName('');
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Página de Inicio del Curso</h2>
      <p className="text-gray-600 mb-8">
        La página de inicio de tu curso es crucial para atraer estudiantes. Crea un título atractivo, una descripción detallada y una imagen de portada impactante.
      </p>

      {/* Input de archivo oculto para la imagen */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {/* Loader Global para la subida de imagen (modal central) */}
      {uploadingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-semibold mb-4">Subiendo archivo...</h3>
            {/* Loader de Uiverse.io */}
            <div className="loader mx-auto">
              <div className="box box-1">
                <div className="side-left"></div>
                <div className="side-right"></div>
                <div className="side-top"></div>
              </div>
              <div className="box box-2">
                <div className="side-left"></div>
                <div className="side-right"></div>
                <div className="side-top"></div>
              </div>
              <div className="box box-3">
                <div className="side-left"></div>
                <div className="side-right"></div>
                <div className="side-top"></div>
              </div>
              <div className="box box-4">
                <div className="side-left"></div>
                <div className="side-right"></div>
                <div className="side-top"></div>
              </div>
            </div>
            {currentFileName && <p className="text-gray-800 font-medium mt-4 truncate">{currentFileName}</p>}
            <p className="text-gray-500 text-xs mt-2">El tiempo restante puede variar.</p>
          </div>
        </div>
      )}

      {/* Estilos CSS para el loader de Uiverse.io */}
      <style jsx>{`
        .loader {
          scale: 3;
          height: 50px;
          width: 40px;
        }

        .box {
          position: relative;
          opacity: 0;
          left: 10px;
        }

        .side-left {
          position: absolute;
          background-color: #286cb5;
          width: 19px;
          height: 5px;
          transform: skew(0deg, -25deg);
          top: 14px;
          left: 10px;
        }

        .side-right {
          position: absolute;
          background-color: #2f85e0;
          width: 19px;
          height: 5px;
          transform: skew(0deg, 25deg);
          top: 14px;
          left: -9px;
        }

        .side-top {
          position: absolute;
          background-color: #5fa8f5;
          width: 20px;
          height: 20px;
          rotate: 45deg;
          transform: skew(-20deg, -20deg);
        }

        .box-1 {
          animation: from-left 4s infinite;
        }

        .box-2 {
          animation: from-right 4s infinite;
          animation-delay: 1s;
        }

        .box-3 {
          animation: from-left 4s infinite;
          animation-delay: 2s;
        }

        .box-4 {
          animation: from-right 4s infinite;
          animation-delay: 3s;
        }

        @keyframes from-left {
          0% {
            z-index: 20;
            opacity: 0;
            translate: -20px -6px;
          }

          20% {
            z-index: 10;
            opacity: 1;
            translate: 0px 0px;
          }

          40% {
            z-index: 9;
            translate: 0px 4px;
          }

          60% {
            z-index: 8;
            translate: 0px 8px;
          }

          80% {
            z-index: 7;
            opacity: 1;
            translate: 0px 12px;
          }

          100% {
            z-index: 5;
            translate: 0px 30px;
            opacity: 0;
          }
        }

        @keyframes from-right {
          0% {
            z-index: 20;
            opacity: 0;
            translate: 20px -6px;
          }

          20% {
            z-index: 10;
            opacity: 1;
            translate: 0px 0px;
          }

          40% {
            z-index: 9;
            translate: 0px 4px;
          }

          60% {
            z-index: 8;
            translate: 0px 8px;
          }

          80% {
            z-index: 7;
            opacity: 1;
            translate: 0px 12px;
          }

          100% {
            z-index: 5;
            translate: 0px 30px;
            opacity: 0;
          }
        }
      `}</style>

      <div className="space-y-6">
        {/* Título del Curso */}
        <div>
          <label htmlFor="course-title" className="block text-lg font-medium text-gray-700 mb-2">
            Título del Curso <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="course-title"
            placeholder="Ej: Curso Completo de Desarrollo Web con React y Node.js"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            value={courseData.titulo || ''}
            onChange={(e) => handleChange('titulo', e.target.value)}
          />
          <p className="mt-2 text-sm text-gray-500">Un título claro y descriptivo atrae a más estudiantes.</p>
        </div>

        {/* Descripción Corta */}
        <div>
          <label htmlFor="short-description" className="block text-lg font-medium text-gray-700 mb-2">
            Descripción Corta <span className="text-red-500">*</span>
          </label>
          <textarea
            id="short-description"
            rows={3}
            placeholder="Ej: Aprende a construir aplicaciones web modernas y escalables desde cero."
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            value={courseData.descripcionCorta || ''}
            onChange={(e) => handleChange('descripcionCorta', e.target.value)}
          ></textarea>
          <p className="mt-2 text-sm text-gray-500">Un resumen conciso que capte la atención.</p>
        </div>

        {/* Descripción Larga */}
        <div>
          <label htmlFor="long-description" className="block text-lg font-medium text-gray-700 mb-2">
            Descripción Larga <span className="text-red-500">*</span>
          </label>
          <textarea
            id="long-description"
            rows={6}
            placeholder="Ofrece una descripción completa de lo que los estudiantes aprenderán, los proyectos que construirán, y cómo el curso les beneficiará."
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            value={courseData.descripcionLarga || ''}
            onChange={(e) => handleChange('descripcionLarga', e.target.value)}
          ></textarea>
          <p className="mt-2 text-sm text-gray-500">Detalla el contenido y los beneficios del curso.</p>
        </div>

        {/* Imagen de Portada del Curso */}
        <div>
          <label htmlFor="course-image" className="block text-lg font-medium text-gray-700 mb-2">
            Imagen de Portada del Curso <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 flex items-center space-x-4">
            {courseData.imagenUrl ? (
              <div className="relative w-48 h-32 rounded-md overflow-hidden border border-gray-300 shadow-sm">
                <Image
                  src={courseData.imagenUrl}
                  alt="Imagen de portada del curso"
                  layout="fill"
                  objectFit="cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/192x128/E0E0E0/888888?text=Error';
                  }}
                />
              </div>
            ) : (
              <div className="w-48 h-32 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 border border-gray-300 shadow-sm">
                No hay imagen
              </div>
            )}
            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={uploadingImage}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center shadow-md"
            >
              {uploadingImage ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Subiendo...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" /> Subir Imagen
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Sube una imagen de alta calidad que represente tu curso (ej. 1280x720 píxeles).
          </p>
        </div>

        {/* URL del Video de Introducción (Opcional) */}
        <div>
          <label htmlFor="intro-video-url" className="block text-lg font-medium text-gray-700 mb-2">
            URL del Video de Introducción (Opcional)
          </label>
          <input
            type="text"
            id="intro-video-url"
            placeholder="Ej: https://tuserver.com/video_intro.mp4"
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-base"
            value={courseData.videoIntroduccionUrl || ''}
            onChange={(e) => handleChange('videoIntroduccionUrl', e.target.value)}
          />
          <p className="mt-2 text-sm text-gray-500">
            Un video corto puede aumentar la conversión de estudiantes.
          </p>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Consejos para la Página de Inicio</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>El título debe ser claro y contener palabras clave relevantes.</li>
          <li>La descripción larga debe ser persuasiva y detallar el valor del curso.</li>
          <li>Utiliza una imagen de portada de alta resolución y que sea visualmente atractiva.</li>
          <li>Considera añadir un video de introducción para dar un adelanto del curso.</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseLandingPageStep;
