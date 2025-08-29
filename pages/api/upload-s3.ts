// pages/api/upload-s3.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from '@/lib/aws'; // Importa tu cliente S3
import formidable from 'formidable';
import { readFileSync, mkdirSync, unlinkSync } from 'fs'; // Importa unlinkSync y mkdirSync
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Deshabilita el body parser predeterminado de Next.js para que formidable pueda manejarlo
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Define la ruta del directorio temporal para los archivos subidos
  const uploadDir = path.join(process.cwd(), 'tmp');

  // Asegúrate de que el directorio temporal exista
  try {
    mkdirSync(uploadDir, { recursive: true });
  } catch (dirError) {
    console.error('Error creating upload directory:', dirError);
    return res.status(500).json({ message: 'Failed to prepare upload directory.' });
  }

  const form = formidable({
    uploadDir: uploadDir, // Usa la ruta completa del directorio temporal
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 1024, // Aumentado a 1GB (1024 MB)
  });

  // Declara 'file' fuera del bloque try para que sea accesible en el finally/catch
  let file: formidable.File | undefined;

  try {
    const [fields, files] = await form.parse(req);
    file = files.file?.[0]; // Asigna el archivo aquí

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileContent = readFileSync(file.filepath);
    const fileExtension = path.extname(file.originalFilename || '');
    const uniqueFileName = `${uuidv4()}${fileExtension}`;

    const s3Key = `uploads/${uniqueFileName}`;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: file.mimetype || 'application/octet-stream',
      // ACL: 'public-read', // ¡ELIMINADO! El bucket no permite ACLs. El acceso se controla por la política de bucket.
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    // Construye la URL pública del archivo en S3
    const fileUrl = `https://${params.Bucket}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${s3Key}`;

    return res.status(200).json({ url: fileUrl, message: 'File uploaded successfully' });

  } catch (error: any) {
    console.error('Error uploading file to S3:', error);
    return res.status(500).json({ message: 'Failed to upload file', error: error.message });
  } finally {
    // Asegura que el archivo temporal se elimine siempre
    if (file && file.filepath) {
      try {
        unlinkSync(file.filepath);
      } catch (unlinkError) {
        console.warn('Could not delete temporary file:', unlinkError);
      }
    }
  }
}
