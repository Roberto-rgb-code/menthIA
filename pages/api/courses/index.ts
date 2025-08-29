import type { NextApiRequest, NextApiResponse } from 'next';
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb"; // Importa los comandos de DynamoDB
import { ddbDocClient } from '../../../lib/dynamodb'; // Importa tu cliente de DynamoDB
import { Curso } from '../../../types/Curso'; // Tu interfaz de Curso
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos

// Instala uuid si no lo tienes: npm install uuid @types/uuid
// Si usas serverTimestamp de Firestore, aquí usaríamos new Date().toISOString()
// Ya que DynamoDB no tiene un tipo de timestamp nativo como Firestore.

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const TABLE_NAME = 'cursos'; // Asegúrate que coincida con el nombre de tu tabla en DynamoDB

  if (req.method === 'GET') {
    try {
      // Obtener todos los cursos de la tabla 'cursos'
      const { Items } = await ddbDocClient.send(new ScanCommand({ TableName: TABLE_NAME }));

      // DynamoDB no tiene el mismo concepto de ID que Firestore (doc.id),
      // el ID es un atributo de cada item. Tampoco tiene Timestamps como objetos.
      // Si tus fechas en Firestore eran Timestamps, ahora serán strings ISO 8601.
      const courses: Curso[] = (Items as Curso[] || []).map(course => ({
        ...course,
        // Asegúrate de que los campos 'fechaCreacion' y 'fechaActualizacion'
        // ya estén guardados como strings ISO en DynamoDB.
        // Si no, necesitarías una lógica de conversión aquí si vinieran en otro formato.
      })).sort((a, b) => {
        // Opcional: Ordenar por fecha de creación descendente si la fecha es un string ISO
        if (a.fechaCreacion && b.fechaCreacion) {
            return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        }
        return 0;
      });

      return res.status(200).json(courses);
    } catch (error) {
      console.error("Error al obtener los cursos de DynamoDB:", error);
      return res.status(500).json({ message: 'Error interno del servidor al obtener los cursos.', error: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    try {
      // Autenticación/autorización sigue siendo CRÍTICA aquí.
      // Necesitas verificar que el usuario sea un instructor.

      const { instructorId, instructorNombre, ...newCourseData } = req.body;

      if (!instructorId || !instructorNombre) {
        return res.status(400).json({ message: 'Instructor ID y Nombre son requeridos.' });
      }

      const newCourseId = uuidv4(); // Genera un ID único para el curso
      const timestamp = new Date().toISOString(); // Fecha actual en formato ISO 8601

      const courseToSave: Curso = { // Asegúrate de que coincida con tu interfaz Curso
        id: newCourseId,
        ...newCourseData,
        instructorId,
        instructorNombre,
        fechaCreacion: timestamp,
        fechaActualizacion: timestamp,
        publicado: newCourseData.publicado ?? false, // Por defecto, el curso no está publicado
        numeroCalificaciones: newCourseData.numeroCalificaciones ?? 0,
        calificacionPromedio: newCourseData.calificacionPromedio ?? 0,
        secciones: newCourseData.secciones || [], // Asegura que secciones sea un array vacío si no viene
        // Asegúrate de que todos los campos del Curso estén presentes, incluso si están vacíos o tienen valores por defecto
        titulo: newCourseData.titulo || '',
        descripcionCorta: newCourseData.descripcionCorta || '',
        descripcionLarga: newCourseData.descripcionLarga || '',
        categoria: newCourseData.categoria || '',
        nivel: newCourseData.nivel || '',
        idioma: newCourseData.idioma || '',
        duracionEstimada: newCourseData.duracionEstimada || 0,
        precio: newCourseData.precio || 0,
        moneda: newCourseData.moneda || 'MXN',
        imagenUrl: newCourseData.imagenUrl || '',
        videoIntroduccionUrl: newCourseData.videoIntroduccionUrl || '',
        requisitos: newCourseData.requisitos || [],
        loQueAprenderas: newCourseData.loQueAprenderas || [],
        // slug: newCourseData.slug || newCourseId, // Opcional: generar slug si no existe
      };

      await ddbDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: courseToSave,
      }));

      return res.status(201).json(courseToSave); // Devuelve el objeto completo con el ID
    } catch (error) {
      console.error("Error al crear el curso en DynamoDB:", error);
      return res.status(500).json({ message: 'Error interno del servidor al crear el curso.', error: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}