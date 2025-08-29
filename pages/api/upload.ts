// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
// Importa tu SDK de AWS S3 u otro servicio de almacenamiento
// import AWS from 'aws-sdk'; // Si usas AWS SDK v2
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"; // Si usas AWS SDK v3
import fs from 'fs'; // Node.js File System para leer el archivo temporal

// Desactiva el body parser por defecto de Next.js para manejar archivos
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function uploadHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = formidable({ multiples: false }); // `multiples: true` si esperas varios archivos

  try {
    const [fields, files] = await form.parse(req);

    // `files` contendrá el archivo subido
    // Asumimos que el input `name` del archivo en el frontend es 'file'
    const uploadedFile = files.file?.[0]; // Accede al primer elemento si `files.file` es un array

    if (!uploadedFile) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // --- Lógica de Subida a S3/Cloudinary/etc. ---
    // ESTA ES LA PARTE QUE DEBES IMPLEMENTAR SEGÚN TU PROVEEDOR

    // Ejemplo (pseudocódigo para S3 - DEBES CONFIGURAR TUS CREDENCIALES y región):
    /*
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const fileStream = fs.createReadStream(uploadedFile.filepath);
    const fileName = `${Date.now()}-${uploadedFile.originalFilename}`; // Nombre único para el archivo
    const bucketName = process.env.S3_BUCKET_NAME; // Tu bucket de S3

    const uploadParams = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileStream,
      ContentType: uploadedFile.mimetype, // Tipo MIME del archivo
      ACL: 'public-read', // Para que el archivo sea público y accesible por URL
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    const fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    */

    // --- SIMULACIÓN DE SUBIDA SI NO TIENES S3 CONFIGURADO AÚN ---
    // Si no tienes S3 o un servicio similar configurado, puedes simularlo
    // Esto es solo para que el frontend no se rompa; NO es una solución para producción.
    const fileUrl = `http://example.com/simulated-upload/${uploadedFile.originalFilename}`;
    console.log(`Simulando subida de archivo: ${uploadedFile.originalFilename}. URL: ${fileUrl}`);
    // Fin de la simulación

    // Limpia el archivo temporal
    fs.unlink(uploadedFile.filepath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    return res.status(200).json({ success: true, url: fileUrl, message: 'File uploaded successfully' });

  } catch (error: any) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ message: 'Failed to upload file', error: error.message });
  }
}