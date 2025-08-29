// pages/api/marketplace/marketplace/upload-signed-url.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_S3_REGION || "us-east-2";
const bucket = process.env.AWS_S3_BUCKET_NAME!;
const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const userId = (req.headers["x-user-id"] as string) || "";
    if (!userId) return res.status(401).json({ error: "missing x-user-id" });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { pathHint, contentType } = body || {};
    if (!pathHint || !contentType) return res.status(400).json({ error: "pathHint & contentType required" });

    const key = `marketplace/${pathHint}`; // ej: providers/<providerId>/logo.webp
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ACL: "public-read" as any });
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    return res.status(200).json({ uploadUrl: url, publicUrl });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || "signed url error" });
  }
}
