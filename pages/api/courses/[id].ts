// pages/api/courses/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GetCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from '../../../lib/dynamodb';

type CursoPublic = {
  id: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  image: string;
  instructorName: string;
  priceCents: number;
  currency: string;
  rating?: number;
  ratingsCount?: number;
  slug?: string;
  createdAt?: string;
  updatedAt?: string;
  sections?: any[];
  // agrega los campos que uses en el detalle
};

function normalize(item: any): CursoPublic {
  const precioNumber =
    typeof item?.precio === 'string' ? parseFloat(item.precio) :
    typeof item?.precio === 'number' ? item.precio : 0;

  const currency = String(item?.moneda || 'MXN').toUpperCase();

  return {
    id: String(item?.id || ''),
    title: String(item?.titulo || ''),
    shortDescription: String(item?.descripcionCorta || ''),
    longDescription: item?.descripcionLarga ? String(item.descripcionLarga) : undefined,
    image: String(item?.imagenUrl || ''),
    instructorName: String(item?.instructorNombre || ''),
    priceCents: Math.max(0, Math.round((Number.isFinite(precioNumber) ? precioNumber : 0) * 100)),
    currency,
    rating: Number.isFinite(item?.calificacionPromedio) ? Number(item.calificacionPromedio) : undefined,
    ratingsCount: Number.isFinite(item?.numeroCalificaciones) ? Number(item.numeroCalificaciones) : undefined,
    slug: item?.slug ? String(item.slug) : undefined,
    createdAt: item?.fechaCreacion ? String(item.fechaCreacion) : undefined,
    updatedAt: item?.fechaActualizacion ? String(item.fechaActualizacion) : undefined,
    sections: Array.isArray(item?.secciones) ? item.secciones : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const TABLE_NAME = 'cursos';

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'ID de curso no válido o faltante.' });
  }

  switch (req.method) {
    case 'GET': {
      try {
        const command = new GetCommand({ TableName: TABLE_NAME, Key: { id } });
        const { Item } = await ddbDocClient.send(command);

        if (!Item) return res.status(404).json({ message: 'Curso no encontrado.' });

        return res.status(200).json({ item: normalize(Item) });
      } catch (error: any) {
        return res.status(500).json({ message: 'Error interno del servidor al obtener el curso.', error: error.message });
      }
    }

    case 'PUT': {
      try {
        const updatedFields = { ...req.body };
        delete updatedFields.id;
        delete updatedFields.instructorId;
        delete updatedFields.fechaCreacion;

        updatedFields.fechaActualizacion = new Date().toISOString();

        let UpdateExpression = 'set ';
        const ExpressionAttributeNames: Record<string, string> = {};
        const ExpressionAttributeValues: Record<string, any> = {};
        let first = true;

        for (const key in updatedFields) {
          if (Object.prototype.hasOwnProperty.call(updatedFields, key)) {
            if (!first) UpdateExpression += ', ';
            UpdateExpression += `#${key} = :${key}`;
            ExpressionAttributeNames[`#${key}`] = key;
            ExpressionAttributeValues[`:${key}`] = updatedFields[key];
            first = false;
          }
        }

        const command = new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { id },
          UpdateExpression,
          ExpressionAttributeNames,
          ExpressionAttributeValues,
          ReturnValues: 'ALL_NEW',
        });

        const { Attributes } = await ddbDocClient.send(command);
        return res.status(200).json({ message: 'Curso actualizado.', item: normalize(Attributes) });
      } catch (error: any) {
        return res.status(500).json({ message: 'Error interno al actualizar el curso.', error: error.message });
      }
    }

    case 'DELETE': {
      try {
        await ddbDocClient.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { id } }));
        return res.status(200).json({ message: 'Curso eliminado.' });
      } catch (error: any) {
        return res.status(500).json({ message: 'Error interno al eliminar el curso.', error: error.message });
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
