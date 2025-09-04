// components/instructor/create-course/CourseReviewPublishStep.tsx
import React, { useMemo } from 'react';
import { Curso } from '@/types/Curso'; // Use @ alias

interface CourseReviewPublishStepProps {
  courseData: Partial<Curso>;
  handlePublish: () => void;
}

const CourseReviewPublishStep: React.FC<CourseReviewPublishStepProps> = ({
  courseData,
  handlePublish,
}) => {
  const totalDurationMinutes = useMemo(() => {
    if (!courseData?.secciones) return 0;
    return courseData.secciones.reduce((accSec, sec) => {
      const secMin = (sec.lecciones || []).reduce((accLec, lec) => accLec + (lec.duracion || 0), 0); // Changed to duracion
      return accSec + secMin;
    }, 0);
  }, [courseData?.secciones]);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Revisar y Publicar</h2>
      <p className="text-gray-700 mb-8">
        Revisa los detalles de tu curso antes de publicarlo.
      </p>
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Resumen del Curso</h3>
        <p><strong>Título:</strong> {courseData.titulo || 'Sin título'}</p>
        <p><strong>Duración Total:</strong> {formatDuration(totalDurationMinutes)}</p>
        <p><strong>Secciones:</strong> {(courseData.secciones || []).length}</p>
        <p><strong>Lecciones:</strong> {(courseData.secciones || []).reduce((acc, s) => acc + (s.lecciones?.length || 0), 0)}</p>
      </div>
      <button
        onClick={handlePublish}
        className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        Publicar Curso
      </button>
    </div>
  );
};

export default CourseReviewPublishStep;