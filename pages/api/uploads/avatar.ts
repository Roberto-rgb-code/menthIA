// pages/api/uploads/avatar.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, S3_BUCKET, S3_PUBLIC_BASE_URL } from "../../../lib/s3";
import { requireUserId } from "../util/getUserId";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { filename, contentType } = req.body || {};
    if (!filename || !contentType) {
      return res.status(400).json({ error: "filename y contentType requeridos" });
    }

    const safe = sanitizeFilename(filename);
    // Guardamos en un prefijo por usuario
    const key = `profiles/${userId}/${Date.now()}-${safe}`;

    // NOTA: si tu bucket tiene “Bucket owner enforced” (ACLs desactivadas), no pongas ACL aquí.
    const cmd = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      ContentType: contentType,
      // ACL: "public-read", // <-- usar solo si tu bucket lo permite; normalmente NO hace falta.
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 }); // 60s
    const publicUrl = `${S3_PUBLIC_BASE_URL}/${key}`;

    return res.status(200).json({ uploadUrl, key, publicUrl });
  } catch (e: any) {
    console.error("avatar presign error", e);
    return res.status(500).json({ error: "No se pudo generar URL de subida" });
  }
}
