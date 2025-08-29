// lib/firestore-collections.ts
import { collection, doc, CollectionReference, DocumentReference } from 'firebase/firestore';
import { db } from './firebase'; // Importa la instancia de Firestore que ya tienes en firebase.ts
import { Curso, ProgresoUsuarioCurso, SuscripcionUsuario, Usuario } from '../types/Curso'; // Asegúrate de que Usuario también esté definida o cámbiala si no existe

// Define aquí los nombres de tus colecciones. Es una buena práctica usar constantes.
const COLLECTION_NAMES = {
  CURSOS: 'cursos',
  USUARIOS: 'users', // Asumiendo que tus usuarios están en una colección 'users'
  PROGRESO_USUARIO_CURSO: 'progresoUsuarioCurso',
  SUSCRIPCIONES_USUARIO: 'suscripcionesUsuario',
  // Puedes añadir más si es necesario, ej. 'categorias', 'reseñas'
};

// --- Referencias de Colecciones ---

/**
 * Referencia a la colección principal de cursos.
 */
export const cursosCollection = collection(db, COLLECTION_NAMES.CURSOS) as CollectionReference<Curso>;

/**
 * Referencia a la colección de usuarios.
 * Asume que tienes una interfaz 'Usuario' definida en types/Curso.ts o en otro lugar.
 */
export const usersCollection = collection(db, COLLECTION_NAMES.USUARIOS) as CollectionReference<Usuario>;

/**
 * Referencia a la colección de progreso de usuario por curso.
 */
export const progresoUsuarioCursoCollection = collection(db, COLLECTION_NAMES.PROGRESO_USUARIO_CURSO) as CollectionReference<ProgresoUsuarioCurso>;

/**
 * Referencia a la colección de suscripciones/compras de cursos por usuario.
 */
export const suscripcionesUsuarioCollection = collection(db, COLLECTION_NAMES.SUSCRIPCIONES_USUARIO) as CollectionReference<SuscripcionUsuario>;


// --- Referencias de Documentos Específicos ---

/**
 * Obtiene una referencia a un documento de curso específico por su ID.
 * @param cursoId El ID del curso.
 */
export const getCursoDocRef = (cursoId: string): DocumentReference<Curso> => {
  return doc(cursosCollection, cursoId) as DocumentReference<Curso>;
};

/**
 * Obtiene una referencia a un documento de progreso de usuario-curso específico.
 * Típicamente, el ID de este documento sería una combinación de userId_cursoId.
 * @param docId El ID del documento de progreso (ej. "userId_cursoId").
 */
export const getProgresoUsuarioCursoDocRef = (docId: string): DocumentReference<ProgresoUsuarioCurso> => {
  return doc(progresoUsuarioCursoCollection, docId) as DocumentReference<ProgresoUsuarioCurso>;
};

/**
 * Obtiene una referencia a un documento de suscripción de usuario-curso específico.
 * Típicamente, el ID de este documento sería una combinación de userId_cursoId o stripeSubscriptionId.
 * @param docId El ID del documento de suscripción.
 */
export const getSuscripcionUsuarioDocRef = (docId: string): DocumentReference<SuscripcionUsuario> => {
  return doc(suscripcionesUsuarioCollection, docId) as DocumentReference<SuscripcionUsuario>;
};

/**
 * Obtiene una referencia a un documento de usuario específico por su ID.
 * @param userId El ID del usuario.
 */
export const getUserDocRef = (userId: string): DocumentReference<Usuario> => {
  return doc(usersCollection, userId) as DocumentReference<Usuario>;
};