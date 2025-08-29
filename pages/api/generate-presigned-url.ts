// pages/api/generate-presigned-url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from '@/lib/aws'; // Importa tu cliente S3 (ya configurado)
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Espera que el frontend envíe el nombre original del archivo y su tipo
  const { fileName: originalFileName, fileType } = req.body;

  if (!originalFileName || !fileType) {
    return res.status(400).json({ message: 'Missing fileName or fileType in request body.' });
  }

  try {
    const fileExtension = path.extname(originalFileName);
    const uniqueFileName = `${uuidv4()}${fileExtension}`; // Nombre único para el archivo en S3
    const s3Key = `uploads/${uniqueFileName}`; // Ruta donde se guardará en S3

    const putCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      ContentType: fileType,
      // No necesitamos ACL aquí si la política de bucket se encarga del acceso público
      // ACL: 'public-read', // Si tu bucket permite ACLs y quieres public-read
    });

    // Genera la URL pre-firmada para una operación PUT
    const presignedUrl = await getSignedUrl(s3Client, putCommand, {
      expiresIn: 3600, // La URL expira en 1 hora (ajusta según tus necesidades)
    });

    // Construye la URL pública final del archivo en S3
    const publicFileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`;

    return res.status(200).json({ presignedUrl, publicFileUrl, message: 'Presigned URL generated successfully.' });

  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).json({ message: 'Failed to generate presigned URL', error: error.message });
  }
}
