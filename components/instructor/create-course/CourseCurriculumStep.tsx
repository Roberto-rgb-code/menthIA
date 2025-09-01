// components/instructor/create-course/CourseCurriculumStep.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Curso, Seccion, Leccion, RecursoDescargable } from '@/types/curso';
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaVideo, FaFileAlt, FaUpload, FaSpinner } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';

interface CourseCurriculumStepProps {
  courseData: Partial<Curso>;
  handleChange: (field: string, value: any) => void;
}

const CourseCurriculumStep: React.FC<CourseCurriculumStepProps> = ({ courseData, handleChange }) => {
  console.log("DEBUG: CourseCurriculumStep - courseData at component start:", courseData);

  if (!courseData) {
    console.warn("CourseCurriculumStep: courseData prop is null or undefined. Showing loading state.");
    return (
      <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg shadow-inner">
        <FaSpinner className="animate-spin text-5xl text-blue-500" />
        <p className="ml-4 text-xl text-gray-700">Cargando estructura del curso...</p>
      </div>
    );
  }

  const sections: Seccion[] = courseData.secciones || [];

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({});

  const [uploadingVideoId, setUploadingVideoId] = useState<string | null>(null);
  const [uploadingResourceId, setUploadingResourceId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ percentage: number; uploadedMb: number; totalMb: number } | null>(null);
  const [currentFileTotalSize, setCurrentFileTotalSize] = useState<number>(0);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const resourceInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<{ sectionId: string; lessonId: string; resourceId?: string } | null>(null);

  // Inicializa qué secciones/lecciones están abiertas
  useEffect(() => {
    const initialOpenSections: Record<string, boolean> = {};
    sections.forEach(sec => { initialOpenSections[sec.id] = true; });
    setOpenSections(initialOpenSections);

    const initialOpenLessons: Record<string, boolean> = {};
    sections.forEach(sec => { (sec.lecciones || []).forEach(lec => { initialOpenLessons[lec.id] = true; }); });
    setOpenLessons(initialOpenLessons);
  }, [courseData]);

  const toggleSection = (section: Seccion) => {
    setOpenSections(prev => ({ ...prev, [section.id]: !prev[section.id] }));
  };

  const toggleLesson = (lesson: Leccion) => {
    setOpenLessons(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }));
  };

  const handleAddSection = () => {
    const newSection: Seccion = {
      id: uuidv4(),
      titulo: '',
      orden: sections.length + 1,
      lecciones: [],
    };
    const updated = [...sections, newSection];
    handleChange('secciones', updated);
    setOpenSections(prev => ({ ...prev, [newSection.id]: true }));
  };

  const handleRemoveSection = (sectionId: string) => {
    const filtered = sections.filter(sec => sec.id !== sectionId);
    // reordenar
    const reordered = filtered.map((s, i) => ({ ...s, orden: i + 1 }));
    handleChange('secciones', reordered);
    setOpenSections(prev => {
      const cp = { ...prev };
      delete cp[sectionId];
      return cp;
    });
  };

  const handleSectionChange = (sectionId: string, field: keyof Seccion, value: any) => {
    const updated = sections.map(sec => sec.id === sectionId ? { ...sec, [field]: value } : sec);
    handleChange('secciones', updated);
  };

  const handleAddLesson = (sectionId: string) => {
    const updated = sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      const nextOrder = (sec.lecciones?.length || 0) + 1;
      const newLesson: Leccion = {
        id: uuidv4(),
        titulo: '',
        tipo: 'video',
        contenidoUrl: '',
        duracion: 0,
        orden: nextOrder,
        recursosDescargables: [],
      };
      return { ...sec, lecciones: [...(sec.lecciones || []), newLesson] };
    });
    handleChange('secciones', updated);
    const lastLesson = updated.find(s => s.id === sectionId)!.lecciones.slice(-1)[0];
    setOpenLessons(prev => ({ ...prev, [lastLesson.id]: true }));
  };

  const handleRemoveLesson = (sectionId: string, lessonId: string) => {
    const updated = sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      const filtered = (sec.lecciones || []).filter(lec => lec.id !== lessonId);
      // reordenar
      const reordered = filtered.map((l, i) => ({ ...l, orden: i + 1 }));
      return { ...sec, lecciones: reordered };
    });
    handleChange('secciones', updated);
    setOpenLessons(prev => {
      const cp = { ...prev };
      delete cp[lessonId];
      return cp;
    });
  };

  const handleLessonChange = (sectionId: string, lessonId: string, field: keyof Leccion, value: any) => {
    const updated = sections.map(sec =>
      sec.id === sectionId
        ? {
            ...sec,
            lecciones: (sec.lecciones || []).map(lec => (lec.id === lessonId ? { ...lec, [field]: value } : lec)),
          }
        : sec
    );
    handleChange('secciones', updated);
  };

  const handleAddResource = (sectionId: string, lessonId: string) => {
    const newResource: RecursoDescargable = { id: uuidv4(), nombre: '', url: '' };
    const updated = sections.map(sec =>
      sec.id === sectionId
        ? {
            ...sec,
            lecciones: (sec.lecciones || []).map(lec =>
              lec.id === lessonId
                ? { ...lec, recursosDescargables: [...(lec.recursosDescargables || []), newResource] }
                : lec
            ),
          }
        : sec
    );
    handleChange('secciones', updated);
  };

  const handleRemoveResource = (sectionId: string, lessonId: string, resourceId: string) => {
    const updated = sections.map(sec =>
      sec.id === sectionId
        ? {
            ...sec,
            lecciones: (sec.lecciones || []).map(lec =>
              lec.id === lessonId
                ? { ...lec, recursosDescargables: (lec.recursosDescargables || []).filter(r => r.id !== resourceId) }
                : lec
            ),
          }
        : sec
    );
    handleChange('secciones', updated);
  };

  const handleResourceChange = (
    sectionId: string,
    lessonId: string,
    resourceId: string,
    field: keyof RecursoDescargable,
    value: any
  ) => {
    const updated = sections.map(sec =>
      sec.id === sectionId
        ? {
            ...sec,
            lecciones: (sec.lecciones || []).map(lec =>
              lec.id === lessonId
                ? {
                    ...lec,
                    recursosDescargables: (lec.recursosDescargables || []).map(res =>
                      res.id === resourceId ? { ...res, [field]: value } : res
                    ),
                  }
                : lec
            ),
          }
        : sec
    );
    handleChange('secciones', updated);
  };

  // --- Subida a S3 (presigned URL) con progreso
  const handleFileUpload = async (file: File, type: 'video' | 'resource', sectionId: string, lessonId: string, resourceId?: string) => {
    if (!file) return;

    setCurrentFileTotalSize(file.size);
    setUploadProgress({ percentage: 0, uploadedMb: 0, totalMb: file.size / (1024 * 1024) });

    try {
      if (type === 'video') setUploadingVideoId(lessonId);
      else setUploadingResourceId(resourceId || null);

      const resp = await fetch('/api/generate-presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.message || 'Error al obtener la URL pre-firmada.');
      }
      const { presignedUrl, publicFileUrl } = await resp.json();

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100;
          const uploadedMb = e.loaded / (1024 * 1024);
          const totalMb = e.total / (1024 * 1024);
          setUploadProgress({
            percentage: parseFloat(percentage.toFixed(2)),
            uploadedMb: parseFloat(uploadedMb.toFixed(2)),
            totalMb: parseFloat(totalMb.toFixed(2)),
          });
        }
      };

      const done = new Promise<void>((resolve, reject) => {
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`S3 status: ${xhr.status}`)));
        xhr.onerror = () => reject(new Error('Error de red en subida.'));
        xhr.onabort = () => reject(new Error('Subida cancelada.'));
      });

      xhr.send(file);
      await done;

      if (type === 'video') {
        handleLessonChange(sectionId, lessonId, 'contenidoUrl', publicFileUrl);
        toast.success('Video subido exitosamente!');
      } else {
        const updated = sections.map(sec =>
          sec.id === sectionId
            ? {
                ...sec,
                lecciones: (sec.lecciones || []).map(lec =>
                  lec.id === lessonId
                    ? {
                        ...lec,
                        recursosDescargables: (lec.recursosDescargables || []).map(res =>
                          res.id === resourceId ? { ...res, url: publicFileUrl } : res
                        ),
                      }
                    : lec
                ),
              }
            : sec
        );
        handleChange('secciones', updated);
        toast.success('Recurso subido exitosamente!');
      }
    } catch (e: any) {
      console.error('Upload error:', e);
      toast.error(e?.message || 'Error al subir el archivo.');
    } finally {
      setUploadingVideoId(null);
      setUploadingResourceId(null);
      setUploadProgress(null);
      setCurrentFileTotalSize(0);
      if (videoInputRef.current) videoInputRef.current.value = '';
      if (resourceInputRef.current) resourceInputRef.current.value = '';
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUploadTarget) {
      handleFileUpload(e.target.files[0], 'video', currentUploadTarget.sectionId, currentUploadTarget.lessonId);
    }
  };

  const handleResourceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUploadTarget?.resourceId) {
      handleFileUpload(
        e.target.files[0],
        'resource',
        currentUploadTarget.sectionId,
        currentUploadTarget.lessonId,
        currentUploadTarget.resourceId
      );
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Estructura del Curso</h2>
      <p className="text-gray-600 mb-8">Crea y organiza el contenido de tu curso en secciones y lecciones.</p>

      <input type="file" ref={videoInputRef} onChange={handleVideoFileChange} accept="video/*" style={{ display: 'none' }} />
      <input type="file" ref={resourceInputRef} onChange={handleResourceFileChange} style={{ display: 'none' }} />

      {(uploadingVideoId || uploadingResourceId) && uploadProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-semibold mb-4">Subiendo 1 archivo...</h3>
            <div className="relative w-64 h-64 mx-auto mb-4 border-2 border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
              <FaVideo className="text-gray-400 text-6xl" />
              <div
                className="absolute bottom-0 left-0 bg-blue-500 transition-all duration-100 ease-linear"
                style={{ height: `${uploadProgress.percentage}%`, width: '100%' }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-lg">
                <span>{uploadProgress.percentage.toFixed(0)}%</span>
              </div>
            </div>
            <p className="text-gray-700 mb-2">
              {uploadProgress.uploadedMb.toFixed(2)} MB de {uploadProgress.totalMb.toFixed(2)} MB
            </p>
            <p className="text-gray-500 text-sm">El tiempo restante puede variar.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header sección */}
            <div
              className={`flex items-center justify-between p-4 cursor-pointer ${
                openSections[section.id] ? 'bg-blue-100' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => toggleSection(section)}
            >
              <div className="flex items-center flex-grow">
                {openSections[section.id] ? <FaChevronUp className="text-blue-600 mr-3" /> : <FaChevronDown className="text-gray-500 mr-3" />}
                <input
                  type="text"
                  placeholder={`Sección ${sectionIndex + 1}: Título de la Sección`}
                  className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold bg-transparent"
                  value={section.titulo}
                  onChange={(e) => handleSectionChange(section.id, 'titulo', e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemoveSection(section.id); }}
                className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
                title="Eliminar Sección"
              >
                <FaTrash />
              </button>
            </div>

            {/* Lecciones */}
            {openSections[section.id] && (
              <div className="p-4 bg-white border-t border-gray-200">
                <h4 className="text-xl font-semibold text-gray-700 mb-4">Lecciones de la Sección</h4>
                <div className="space-y-4 mb-6">
                  {(section.lecciones || []).map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="border border-gray-100 rounded-lg shadow-sm overflow-hidden">
                      {/* Header lección */}
                      <div
                        className={`flex items-center justify-between p-3 cursor-pointer ${
                          openLessons[lesson.id] ? 'bg-gray-100' : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => toggleLesson(lesson)}
                      >
                        <div className="flex items-center flex-grow">
                          {openLessons[lesson.id] ? <FaChevronUp className="text-gray-600 mr-2 text-sm" /> : <FaChevronDown className="text-gray-400 mr-2 text-sm" />}
                          <span className="font-medium text-gray-800">Lección {lessonIndex + 1}:</span>
                          <input
                            type="text"
                            placeholder="Título de la Lección"
                            className="ml-2 flex-grow p-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base bg-transparent"
                            value={lesson.titulo}
                            onChange={(e) => handleLessonChange(section.id, lesson.id, 'titulo', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRemoveLesson(section.id, lesson.id); }}
                          className="ml-4 p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                          title="Eliminar Lección"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {/* Cuerpo lección */}
                      {openLessons[lesson.id] && (
                        <div className="p-4 bg-white border-t border-gray-100 space-y-4">
                          {/* Tipo */}
                          <div>
                            <label htmlFor={`lesson-type-${lesson.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Tipo de Contenido
                            </label>
                            <select
                              id={`lesson-type-${lesson.id}`}
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={lesson.tipo}
                              onChange={(e) => handleLessonChange(section.id, lesson.id, 'tipo', e.target.value as Leccion['tipo'])}
                            >
                              <option value="video">Video</option>
                              <option value="articulo">Artículo</option>
                              <option value="quiz">Quiz</option>
                              <option value="descargable">Descargable</option>
                            </select>
                          </div>

                          {/* URL contenido */}
                          <div>
                            <label htmlFor={`lesson-content-url-${lesson.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              <FaVideo className="inline-block mr-2 text-blue-500" /> URL del Contenido
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                id={`lesson-content-url-${lesson.id}`}
                                placeholder="Ej: https://tus3/video_leccion.mp4"
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                value={lesson.contenidoUrl}
                                onChange={(e) => handleLessonChange(section.id, lesson.id, 'contenidoUrl', e.target.value)}
                              />
                              <button
                                onClick={() => { setCurrentUploadTarget({ sectionId: section.id, lessonId: lesson.id }); videoInputRef.current?.click(); }}
                                disabled={uploadingVideoId === lesson.id}
                                className="mt-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                                title="Subir Video a S3"
                              >
                                {uploadingVideoId === lesson.id ? <FaSpinner className="animate-spin mr-2" /> : <FaUpload className="mr-2" />}
                                Subir Video
                              </button>
                            </div>
                            {lesson.contenidoUrl && (
                              <div className="mt-2 text-sm text-gray-500 truncate">
                                <span className="font-semibold">URL actual:</span> {lesson.contenidoUrl}
                              </div>
                            )}
                          </div>

                          {/* Duración */}
                          <div>
                            <label htmlFor={`lesson-duration-${lesson.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                              Duración (minutos)
                            </label>
                            <input
                              type="number"
                              id={`lesson-duration-${lesson.id}`}
                              placeholder="Ej: 15"
                              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                              value={lesson.duracion}
                              onChange={(e) => handleLessonChange(section.id, lesson.id, 'duracion', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          {/* Recursos Descargables */}
                          <div className="border-top border-gray-200 pt-4 mt-4">
                            <h5 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                              <FaFileAlt className="inline-block mr-2 text-green-600" /> Recursos Descargables
                            </h5>
                            <div className="space-y-3">
                              {(lesson.recursosDescargables || []).map((resource) => (
                                <div key={resource.id} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    placeholder="Nombre del Recurso"
                                    className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={resource.nombre}
                                    onChange={(e) => handleResourceChange(section.id, lesson.id, resource.id, 'nombre', e.target.value)}
                                  />
                                  <input
                                    type="text"
                                    placeholder="URL del Archivo"
                                    className="flex-grow p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                    value={resource.url}
                                    onChange={(e) => handleResourceChange(section.id, lesson.id, resource.id, 'url', e.target.value)}
                                  />
                                  <button
                                    onClick={() => { setCurrentUploadTarget({ sectionId: section.id, lessonId: lesson.id, resourceId: resource.id }); resourceInputRef.current?.click(); }}
                                    disabled={uploadingResourceId === resource.id}
                                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                                    title="Subir Archivo a S3"
                                  >
                                    {uploadingResourceId === resource.id ? <FaSpinner className="animate-spin" /> : <FaUpload />}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleRemoveResource(section.id, lesson.id, resource.id); }}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                    title="Eliminar Recurso"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button
                              onClick={() => handleAddResource(section.id, lesson.id)}
                              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center text-sm"
                            >
                              <FaPlus className="mr-2" /> Añadir Recurso
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleAddLesson(section.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" /> Añadir Lección
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAddSection}
        className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center w-full md:w-auto"
      >
        <FaPlus className="mr-2" /> Añadir Nueva Sección
      </button>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
        <h3 className="font-bold text-lg mb-2">Consejos para la Estructura del Curso</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Organiza tu contenido en secciones lógicas para facilitar el aprendizaje.</li>
          <li>Cada lección debe tener un título claro y un tipo de contenido definido.</li>
          <li>Sube tus videos/recursos a S3 con URLs accesibles.</li>
          <li>Puedes añadir múltiples recursos descargables por lección.</li>
        </ul>
      </div>
    </div>
  );
};

export default CourseCurriculumStep;
