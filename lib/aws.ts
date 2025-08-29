// lib/aws.ts
import { S3Client } from "@aws-sdk/client-s3";

// Utiliza las variables de entorno de solo servidor para las credenciales
// Esto asegura que tus claves de acceso no se expongan al frontend.
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "us-east-2", // Usar AWS_S3_REGION
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!, // Usar AWS_S3_ACCESS_KEY_ID
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!, // Usar AWS_S3_SECRET_ACCESS_KEY
  },
});

export default s3Client;
