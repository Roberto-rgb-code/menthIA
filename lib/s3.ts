// lib/s3.ts
import { S3Client } from "@aws-sdk/client-s3";

export const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME as string;
export const S3_REGION = process.env.AWS_S3_REGION as string;
export const S3_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_S3_BUCKET_BASE_URL as string;

if (!S3_BUCKET || !S3_REGION) {
  console.warn("[S3] Falta AWS_S3_BUCKET_NAME o AWS_S3_REGION en .env.local");
}

export const s3 = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY as string,
  },
});
