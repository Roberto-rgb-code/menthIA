// pages/api/s3/presigned-url.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { fileName, fileType, folder } = req.body;

  if (!fileName || !fileType || !folder) {
    return res.status(400).json({ message: 'Missing fileName, fileType, or folder in request body.' });
  }

  // Configura el cliente S3 con tus credenciales de AWS
  // Es CRÍTICO que estas credenciales se manejen como variables de entorno
  // y NUNCA se expongan en el código del cliente.
  const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  // Define tu Bucket de S3
  const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

  if (!S3_BUCKET_NAME) {
    console.error("S3_BUCKET_NAME environment variable is not set.");
    return res.status(500).json({ message: 'Server configuration error: S3 bucket name not set.' });
  }

  // Genera un nombre de archivo único para evitar colisiones y mantener la organización
  // Puedes usar un UUID o un timestamp para esto, combinado con el nombre original.
  const fileExtension = fileName.split('.').pop();
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  const s3Key = `${folder}/${uniqueFileName}`; // Ejemplo: 'course-images/123456789-abcde.jpg'

  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: s3Key, // La ruta y nombre del archivo en S3
    ContentType: fileType,
    ACL: 'public-read', // Permite que el archivo sea accesible públicamente después de la subida
  };

  try {
    const command = new PutObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL válida por 1 hora (3600 segundos)

    return res.status(200).json({ url: signedUrl, key: s3Key });
  } catch (error) {
    console.error("Error generating S3 presigned URL:", error);
    return res.status(500).json({ message: 'Error generating S3 presigned URL.', error: (error as Error).message });
  }
}