// pages/cursos/[id].tsx
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import PrivateLayout from '@/components/layout/PrivateLayout';
import {
  FaPlayCircle,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaUserCircle,
  FaClock,
  FaLanguage,
  FaCheckCircle,
  FaSpinner,
  FaShoppingCart,
} from 'react-icons/fa';
import type { Curso, Seccion, Leccion } from '@/types/Curso';

// --------- Normalizador flexible (acepta Curso y CursoPublic) ----------
function normalizeToCurso(raw: any): Curso {
  const data = raw?.item ?? raw?.course ?? raw;

  if (data && (data.titulo || data.secciones || data.precio !== undefined)) {
    return {
      id: String(data.id || ''),
      titulo: String(data.titulo || ''),
      descripcionCorta: String(data.descripcionCorta || ''),
      descripcionLarga: String(data.descripcionLarga || ''),
      categoria: String(data.categoria || ''),
      nivel: String(data.nivel || ''),
      idioma: String(data.idioma || 'Español'),
      duracionEstimada: Number.isFinite(data.duracionEstimada) ? Number(data.duracionEstimada) : 0,
      precio: Number.isFinite(data.precio) ? Number(data.precio) : 0,
      moneda: String(data.moneda || 'MXN').toUpperCase(),
      imagenUrl: String(data.imagenUrl || ''),
      videoIntroduccionUrl: String(data.videoIntroduccionUrl || ''),
      requisitos: Array.isArray(data.requisitos) ? data.requisitos : [],
      loQueAprenderas: Array.isArray(data.loQueAprenderas) ? data.loQueAprenderas : [],
      secciones: Array.isArray(data.secciones) ? data.secciones : [],
      instructorId: data.instructorId ? String(data.instructorId) : '',
      instructorNombre: data.instructorNombre ? String(data.instructorNombre) : '',
      fechaCreacion: data.fechaCreacion ? String(data.fechaCreacion) : undefined,
      fechaActualizacion: data.fechaActualizacion ? String(data.fechaActualizacion) : undefined,
      publicado: Boolean(data.publicado),
      numeroCalificaciones: Number.isFinite(data.numeroCalificaciones) ? Number(data.numeroCalificaciones) : 0,
      calificacionPromedio: Number.isFinite(data.calificacionPromedio) ? Number(data.calificacionPromedio) : 0,
      slug: data.slug ?? undefined,
      mensajeBienvenida: data.mensajeBienvenida ?? undefined,
      mensajeFelicidades: data.mensajeFelicidades ?? undefined,
      publicoObjetivo: data.publicoObjetivo ?? undefined,
      descuentoInicial: data.descuentoInicial ?? undefined,
      dedicacionTiempo: data.dedicacionTiempo ?? undefined,
    } as Curso;
  }

  const priceCents = Number.isFinite(data?.priceCents) ? Number(data.priceCents) : 0;
  return {
    id: String(data?.id || ''),
    titulo: String(data?.title || ''),
    descripcionCorta: String(data?.shortDescription || ''),
    descripcionLarga: '',
    categoria: '',
    nivel: '',
    idioma: 'Español',
    duracionEstimada: 0,
    precio: Math.max(0, priceCents / 100),
    moneda: String(data?.currency || 'MXN').toUpperCase(),
    imagenUrl: String(data?.image || ''),
    videoIntroduccionUrl: '',
    requisitos: [],
    loQueAprenderas: [],
    secciones: [],
    instructorId: '',
    instructorNombre: String(data?.instructorName || ''),
    fechaCreacion: data?.createdAt || undefined,
    fechaActualizacion: data?.updatedAt || undefined,
    publicado: true,
    numeroCalificaciones: Number.isFinite(data?.ratingsCount) ? Number(data.ratingsCount) : 0,
    calificacionPromedio: Number.isFinite(data?.rating) ? Number(data.rating) : 0,
    slug: data?.slug || undefined,
  } as Curso;
}

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState<Curso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeLesson, setActiveLesson] = useState<Leccion | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'instructor' | 'reviews'>('overview');

  const [paying, setPaying] = useState(false);
  const [adding, setAdding] = useState(false);

  // ------- fetch -------
  useEffect(() => {
    const courseId = Array.isArray(id) ? id[0] : id;
    if (!courseId) return;

    (async () => {
      try {
        setLoading(true);
        let r = await fetch(`/api/courses/${courseId}`);
        let data: any;
        if (r.ok) {
          data = await r.json();
        } else {
          const list = await fetch(`/api/courses`);
          const j = await list.json().catch(() => ({}));
          const items = j?.items || j?.data || [];
          data = items.find((x: any) => String(x?.id) === String(courseId)) || null;
          if (!data) throw new Error('No se encontró el curso.');
        }

        const normalized = normalizeToCurso(data);
        setCourse(normalized);

        if (normalized.secciones?.length) {
          setOpenSections(new Set([normalized.secciones[0].id]));
          if (normalized.secciones[0].lecciones?.length) {
            setActiveLesson(normalized.secciones[0].lecciones[0]);
          }
        }
        // console.log('[Course JSON crudo]', data);
      } catch (e: any) {
        console.error(e);
        setError(e?.message || 'Error al cargar el curso.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // ------- helpers -------
  const totalDurationMinutes = useMemo(() => {
    if (!course?.secciones) return 0;
    return course.secciones.reduce((acc, s) => {
      const mins = (s.lecciones || []).reduce((a, l) => a + (l.duracion || 0), 0); // Changed to duracion
      return acc + mins;
    }, 0);
  }, [course?.secciones]);

  const formatDuration = (m: number) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return h ? `${h}h ${mm}m` : `${mm}m`;
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const priceCents = useMemo(
    () => Math.max(0, Math.round((course?.precio || 0) * 100)),
    [course?.precio]
  );

  const priceFormatted = useMemo(() => {
    const cur = (course?.moneda || 'MXN').toUpperCase();
    try {
      return new Intl.NumberFormat('es-MX', { style: 'currency', currency: cur }).format(course?.precio || 0);
    } catch {
      return `${cur} ${(course?.precio ?? 0).toFixed(2)}`;
    }
  }, [course?.precio, course?.moneda]);

  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => {
      const ns = new Set(prev);
      ns.has(sectionId) ? ns.delete(sectionId) : ns.add(sectionId);
      return ns;
    });
  };

  // ------- actions -------
  // Ahora redirige a /checkout con los datos del curso como query
  const goToCheckoutCurso = async () => {
    if (!course) return;
    if (!priceCents) {
      alert('Este curso no tiene un precio válido.');
      return;
    }
    try {
      setPaying(true);
      await router.push({
        pathname: '/checkout',
        query: {
          kind: 'curso',
          courseId: course.id,
          title: course.titulo,
          priceCents: String(priceCents),
          currency: (course.moneda || 'MXN').toUpperCase(),
          image: course.imagenUrl || '',
          instructorName: course.instructorNombre || '',
        },
      });
    } finally {
      setPaying(false);
    }
  };

  const addToCart = async () => {
    if (!course) return;
    try {
      setAdding(true);
      const key = 'mentorapp_cart_courses';
      const current: any[] = JSON.parse(localStorage.getItem(key) || '[]');
      if (!current.find(c => c.id === course.id)) {
        current.push({
          id: course.id,
          title: course.titulo,
          priceCents,
          currency: (course.moneda || 'MXN').toUpperCase(),
          image: course.imagenUrl || '',
          instructorName: course.instructorNombre || '',
        });
        localStorage.setItem(key, JSON.stringify(current));
      }
      // (opcional) llamar a un endpoint de carrito si lo tienes:
      try {
        await fetch('/api/marketplace/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: 'curso',
            courseId: course.id,
            priceCents,
            currency: (course.moneda || 'MXN').toUpperCase(),
          }),
        });
      } catch {}
      alert('Curso añadido al carrito.');
    } finally {
      setAdding(false);
    }
  };

  // ------- render -------
  if (loading) {
    return (
      <PrivateLayout>
        <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
          <FaSpinner className="animate-spin text-5xl text-blue-500" />
          <p className="ml-4 text-xl text-gray-700">Cargando curso…</p>
        </div>
      </PrivateLayout>
    );
  }

  if (error || !course) {
    return (
      <PrivateLayout>
        <div className="flex flex-col justify-center items-center min-h-[60vh] bg-gray-50 text-red-600">
          <p className="text-2xl mb-4">Error: {error || 'Curso no encontrado.'}</p>
          <Link href="/dashboard/cursos" className="text-blue-600 hover:underline">
            Volver a mis cursos
          </Link>
        </div>
      </PrivateLayout>
    );
  }

  return (
    <PrivateLayout>
      <Head>
        <title>{course.titulo} | MentorApp</title>
      </Head>

      {/* HERO */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Izquierda */}
            <div className="md:w-2/3">
              <h1 className="text-4xl font-bold mb-4">{course.titulo}</h1>
              <p className="text-lg md:text-xl mb-4 opacity-90">{course.descripcionCorta}</p>

              <div className="flex flex-wrap items-center text-sm gap-x-3 gap-y-2 mb-4">
                <span className="text-yellow-400 flex items-center">
                  {(course.calificacionPromedio ?? 0).toFixed(1)}
                  <FaStar className="ml-1" />
                </span>
                <span className="opacity-80">({course.numeroCalificaciones || 0} calificaciones)</span>
                <span className="opacity-60">•</span>
                <span className="opacity-80">
                  Creado por{' '}
                  <Link href={`/instructor/${course.instructorId || ''}`} className="text-blue-300 hover:underline">
                    {course.instructorNombre || 'Instructor'}
                  </Link>
                </span>
              </div>

              <div className="flex flex-wrap items-center text-sm gap-x-4 gap-y-2 mb-6 opacity-80">
                <span className="inline-flex items-center">
                  <FaClock className="mr-2" /> Última actualización: {formatDate(course.fechaActualizacion)}
                </span>
                <span className="inline-flex items-center">
                  <FaLanguage className="mr-2" /> {course.idioma || 'Español'}
                </span>
              </div>

              <div className="mt-2 flex items-center flex-wrap gap-3">
                <button
                  onClick={goToCheckoutCurso}
                  disabled={paying || !priceCents}
                  className="bg-purple-600 disabled:bg-purple-600/60 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors shadow-lg"
                  title={!priceCents ? 'Precio inválido' : 'Ir a checkout'}
                >
                  {paying ? 'Redirigiendo…' : `Inscribirse ahora — ${priceFormatted}`}
                </button>

                <button
                  onClick={addToCart}
                  disabled={adding}
                  className="bg-gray-700 text-white px-5 py-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition-colors inline-flex items-center"
                >
                  <FaShoppingCart className="mr-2" />
                  {adding ? 'Agregando…' : 'Añadir al carrito'}
                </button>
              </div>
            </div>

            {/* Derecha: vídeo o imagen */}
            <div className="md:w-1/3 relative rounded-lg overflow-hidden shadow-xl w-full">
              {course.videoIntroduccionUrl ? (
                <video
                  src={course.videoIntroduccionUrl}
                  controls
                  className="w-full h-auto max-h-64 object-cover"
                  poster={course.imagenUrl || undefined}
                />
              ) : (
                <div className="relative w-full h-64 bg-gray-800">
                  <Image
                    src={course.imagenUrl || 'https://via.placeholder.com/800x450.png?text=Curso'}
                    alt={course.titulo || 'Imagen del curso'}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>
              )}

              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 to-transparent p-4 flex items-end">
                <div className="text-white text-sm">
                  <p className="font-bold text-lg mb-1">Este curso incluye:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>{formatDuration(totalDurationMinutes)} de video bajo demanda</li>
                    <li>
                      {(course.secciones || []).reduce((acc, s) => acc + (s.lecciones?.length || 0), 0)} lecciones
                    </li>
                    <li>
                      {(course.secciones || []).reduce(
                        (acc, s) =>
                          acc +
                          (s.lecciones || []).reduce(
                            (accL, l) => accL + (l.recursosDescargables?.length || 0),
                            0
                          ),
                        0
                      )}{' '}
                      recursos descargables
                    </li>
                    <li>Acceso de por vida</li>
                    <li>Acceso en dispositivos móviles y TV</li>
                    <li>Certificado de finalización</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['overview', 'curriculum', 'instructor', 'reviews'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-lg ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab === 'overview' && 'Descripción general'}
                {tab === 'curriculum' && 'Contenido del curso'}
                {tab === 'instructor' && 'Instructor'}
                {tab === 'reviews' && 'Reseñas'}
              </button>
            ))}
          </nav>
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {!!(course.loQueAprenderas || []).filter(s => s && s.trim()).length && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Lo que aprenderás</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                  {(course.loQueAprenderas || []).map((txt, idx) =>
                    txt?.trim() ? (
                      <li key={idx} className="flex items-start text-gray-700">
                        <FaCheckCircle className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span>{txt}</span>
                      </li>
                    ) : null
                  )}
                </ul>
              </section>
            )}

            {course.descripcionLarga?.trim() && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.descripcionLarga}</p>
              </section>
            )}

            {!!(course.requisitos || []).filter(s => s && s.trim()).length && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Requisitos</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {(course.requisitos || []).map((req, idx) => (req?.trim() ? <li key={idx}>{req}</li> : null))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* CURRICULUM */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Contenido del Curso</h2>
            <div className="text-gray-600 text-sm mb-4">
              {(course.secciones || []).length} secciones •{' '}
              {(course.secciones || []).reduce((acc, s) => acc + (s.lecciones?.length || 0), 0)} lecciones •{' '}
              {formatDuration(totalDurationMinutes)} de duración total
            </div>

            {(course.secciones || []).map((section: Seccion) => {
              const secMinutes = (section.lecciones || []).reduce((a, l) => a + (l.duracion || 0), 0); // Changed to duracion
              const opened = openSections.has(section.id);
              return (
                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="flex items-center">
                      {opened ? <FaChevronUp className="text-blue-600 mr-3" /> : <FaChevronDown className="text-gray-500 mr-3" />}
                      <h3 className="text-lg font-semibold text-gray-800">{section.titulo || 'Sección'}</h3>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(section.lecciones || []).length} lecciones • {formatDuration(secMinutes)}
                    </span>
                  </div>

                  {opened && (
                    <div className="border-t border-gray-200 bg-white">
                      {(section.lecciones || []).map(lesson => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setActiveLesson(lesson)}
                        >
                          <div className="flex items-center">
                            <FaPlayCircle className="mr-3 text-blue-500" />
                            <span className="font-medium">{lesson.titulo || 'Lección'}</span>
                          </div>
                          <span className="text-sm text-gray-500">{formatDuration(lesson.duracion || 0)}</span> {/* Changed to duracion */}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* INSTRUCTOR */}
        {activeTab === 'instructor' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sobre el Instructor</h2>
            <div className="flex items-center space-x-4">
              <FaUserCircle className="text-6xl text-gray-500" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{course.instructorNombre || 'Instructor'}</h3>
                <p className="text-gray-600 text-sm">Instructor en MentorApp</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              El instructor {course.instructorNombre || 'del curso'} es un profesional con experiencia y vocación por enseñar.
            </p>
            <Link href={`/instructor/${course.instructorId || ''}`} className="text-blue-600 hover:underline font-semibold">
              Ver perfil del instructor
            </Link>
          </div>
        )}

        {/* REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reseñas de Estudiantes</h2>
            {!(course.numeroCalificaciones && course.numeroCalificaciones > 0) ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600 text-lg">Aún no hay reseñas para este curso.</p>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <p className="text-gray-700">
                  Calificación promedio:{' '}
                  <span className="font-bold text-yellow-500">
                    {(course.calificacionPromedio ?? 0).toFixed(1)} <FaStar className="inline" />
                  </span>{' '}
                  ({course.numeroCalificaciones} reseñas)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </PrivateLayout>
  );
};

export default CourseDetailPage;