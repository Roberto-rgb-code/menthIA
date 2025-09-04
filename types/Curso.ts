// types/Curso.ts

export type TipoLeccion = 'video' | 'articulo' | 'quiz' | 'descargable';

export interface RecursoDescargable {
  id: string;
  nombre: string;
  url: string;
}

// --- 3. Lecciones del Curso ---
export interface Leccion {
  id: string;
  titulo: string;
  orden: number;                 // Posición dentro de la sección
  tipo: TipoLeccion;             // 'video' | 'articulo' | 'quiz' | 'descargable'
  contenidoUrl: string;          // URL del video/archivo/HTML/etc.
  duracion: number;              // En minutos (0 si no aplica)
  descripcion?: string;
  esVistaPrevia?: boolean;
  recursosDescargables?: RecursoDescargable[];
  imagenUrl?: string;            // Added previously
  contenidoTexto?: string;       // Added to fix the error
}

// --- 2. Secciones del Curso ---
export interface Seccion {
  id: string;                    // UUID
  titulo: string;
  orden: number;                 // Posición dentro del curso
  descripcion?: string;
  lecciones: Leccion[];
  duracionSeccion?: number;
}

// --- 1. Curso Principal ---
export interface Curso {
  id?: string;
  titulo: string;
  slug?: string;
  descripcionCorta?: string;
  descripcionLarga: string;
  categoria: string;
  subcategoria?: string;
  idioma: string;
  nivel: 'principiante' | 'intermedio' | 'avanzado' | 'todos';
  precio: number;
  moneda: string;
  duracionEstimada?: number;

  imagenUrl: string;
  videoIntroduccionUrl?: string;

  instructorId: string;
  instructorNombre: string;

  fechaCreacion: Date | string;
  fechaActualizacion: Date | string;

  publicado: boolean;
  aprobado?: boolean;

  requisitos: string[];
  loQueAprenderas: string[];

  dedicacionTiempo?: string;
  publicoObjetivo?: string;
  descuentoInicial?: string;
  mensajeBienvenida?: string;
  mensajeFelicidades?: string;

  calificacionPromedio?: number;
  numeroCalificaciones?: number;

  secciones: Seccion[];
}

// --- 4. Progreso del Usuario en una Lección ---
export interface ProgresoLeccion {
  leccionId: string;
  completada: boolean;
  fechaCompletado?: Date | string;
}

// --- 5. Progreso General del Usuario en un Curso ---
export interface ProgresoUsuarioCurso {
  id?: string;
  userId: string;
  cursoId: string;
  leccionesCompletadas: ProgresoLeccion[];
  porcentajeCompletado: number;
  fechaInscripcion: Date | string;
  fechaUltimoAcceso: Date | string;
  cursoCompletado: boolean;
  fechaCompletado?: Date | string;
}

// --- 6. Suscripción/Compra de Curso por Usuario ---
export interface SuscripcionUsuario {
  id?: string;
  userId: string;
  cursoId: string;
  estado: 'activo' | 'cancelado' | 'reembolsado';
  tipoAcceso: 'compraUnica' | 'membresia';
  fechaInicio: Date | string;
  fechaFin?: Date | string;
  precioPagado: number;
  monedaPagada: string;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  metodoPago?: string;
}