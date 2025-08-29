// types/Curso.ts

// --- 1. Curso Principal ---
export interface Curso {
  id?: string; // Opcional porque Firestore/DynamoDB lo asigna al crear o lo manejamos
  titulo: string;
  slug?: string; // Para URLs amigables (ej. /cursos/mi-curso-seo). Hacer opcional si no siempre se usa.
  descripcionCorta?: string; // Resumen breve (lo hago opcional por si no es obligatorio en algún paso)
  descripcionLarga: string; // Contenido detallado del curso
  categoria: string;
  subcategoria?: string;
  idioma: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'todos';
  precio: number; // Precio en la moneda local (ej. MXN)
  moneda: string; // Ej. 'MXN', 'USD'
  duracionEstimada?: number; // En horas (lo hago opcional por si no se calcula en todos los casos)

  // URLs de contenido principal del curso
  imagenUrl: string; // URL de la imagen de portada del curso (S3)
  videoIntroduccionUrl?: string; // URL del video de introducción (S3)

  instructorId: string; // ID del usuario que creó el curso
  instructorNombre: string; // Nombre del instructor para mostrar

  fechaCreacion: Date | string; // Fecha de creación (ISO string para DynamoDB)
  fechaActualizacion: Date | string; // Última actualización (ISO string para DynamoDB)

  publicado: boolean; // Si el curso está visible públicamente
  aprobado?: boolean; // Para un flujo de aprobación de admin (opcional)

  requisitos: string[]; // Array de strings con requisitos previos
  loQueAprenderas: string[]; // Array de strings con objetivos de aprendizaje

  // Nuevos campos del formulario de creación
  dedicacionTiempo?: string; // Ej. '0-2 horas', '2-4 horas', 'más de 5 horas', 'Todavía no he decidido'
  publicoObjetivo?: string; // Descripción de para quién es este curso
  descuentoInicial?: string; // Nuevo: Para el campo de promociones (ej. '20% de descuento')
  mensajeBienvenida?: string; // Nuevo: Mensaje de bienvenida del curso
  mensajeFelicidades?: string; // Nuevo: Mensaje de felicitaciones al finalizar

  calificacionPromedio?: number; // Calculada dinámicamente o por función cloud
  numeroCalificaciones?: number; // Número de calificaciones

  secciones: Seccion[]; // Array de secciones del curso

  // Puedes añadir más campos según sea necesario (ej. tags, meta-descripcion SEO)
}

// --- 2. Secciones del Curso ---
export interface Seccion {
  id: string; // UUID generado en el frontend o backend
  titulo: string;
  orden: number; // Posición dentro del curso
  descripcion?: string;
  lecciones: Leccion[]; // Array de lecciones dentro de esta sección
  duracionSeccion?: number; // Calculada a partir de las lecciones
}

// --- 3. Lecciones del Curso ---
export interface Leccion {
  id: string; // UUID
  titulo: string;
  orden: number; // Posición dentro de la sección
  tipo: 'video' | 'articulo' | 'quiz' | 'descargable'; // Tipo de contenido
  contenidoUrl: string; // URL del video (S3), o HTML/Markdown, o quiz ID
  duracion: number; // En minutos para videos/artículos, 0 para quizzes/descargables
  descripcion?: string; // Descripción de la lección
  esVistaPrevia?: boolean; // Si es una lección gratuita de vista previa
  recursosDescargables?: { nombre: string; url: string }[]; // Archivos adjuntos
}

// --- 4. Progreso del Usuario en una Lección ---
export interface ProgresoLeccion {
  leccionId: string;
  completada: boolean;
  fechaCompletado?: Date | string;
  // Puedes añadir tiempo de visualización para videos, etc.
}

// --- 5. Progreso General del Usuario en un Curso ---
export interface ProgresoUsuarioCurso {
  id?: string; // Opcional, ID del documento en Firestore (userId_courseId)
  userId: string;
  cursoId: string;
  leccionesCompletadas: ProgresoLeccion[]; // Array de lecciones completadas
  porcentajeCompletado: number; // Calculado
  fechaInscripcion: Date | string;
  fechaUltimoAcceso: Date | string;
  cursoCompletado: boolean;
  fechaCompletado?: Date | string;
  // Puedes añadir certificados, calificaciones de quizzes, etc.
}

// --- 6. Suscripción/Compra de Curso por Usuario ---
export interface SuscripcionUsuario {
  id?: string; // Opcional, ID del documento en Firestore (userId_courseId)
  userId: string;
  cursoId: string;
  estado: 'activo' | 'cancelado' | 'reembolsado'; // Estado de la suscripción
  tipoAcceso: 'compraUnica' | 'membresia'; // Cómo accedió al curso
  fechaInicio: Date | string;
  fechaFin?: Date | string; // Solo si es por membresía
  precioPagado: number;
  monedaPagada: string;
  stripeSessionId?: string; // ID de la sesión de Stripe (checkout.session.completed)
  stripeSubscriptionId?: string; // ID de la suscripción de Stripe (si aplica)
  metodoPago?: string; // Ej. 'card', 'paypal'
  // Puedes añadir más detalles de la transacción
}