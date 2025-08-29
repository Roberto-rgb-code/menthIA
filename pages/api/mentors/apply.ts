// pages/api/mentors/apply.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_PROFILES } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const {
      fullName,
      areasInteres = [],
      porQueSoyMentor,
      comoPuedoAyudar,
      acercaDeMi,
      idiomas = [],
      experiencia,
      country,
      photoUrl,
      hourlyRate,
    } = req.body || {};

    if (!fullName || !porQueSoyMentor || !comoPuedoAyudar || !acercaDeMi || !experiencia) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    // ⛔ Evita postulación si ya es mentor
    const prev = await ddb.send(new GetCommand({ TableName: TABLE_PROFILES, Key: { userId } }));
    if (prev.Item?.role === "mentor") {
      return res.status(409).json({ error: "Ya tienes un perfil de mentor." });
    }

    const now = new Date().toISOString();
    const role = "mentor";
    const status = "approved";                 // ✅ aprobación automática
    const roleStatus = `${role}#${status}`;

    await ddb.send(new PutCommand({
      TableName: TABLE_PROFILES,
      Item: {
        userId,
        role,
        status,
        roleStatus,
        fullName,
        areasInteres,
        porQueSoyMentor,
        comoPuedoAyudar,
        acercaDeMi,
        idiomas,
        experiencia,
        country,
        photoUrl,
        hourlyRate: Number(hourlyRate) || 0,
        rating: 0,
        sessionsCount: 0,
        createdAt: now,
        updatedAt: now,
      },
      // (Opcional) condición para asegurar unicidad si otro proceso intenta crear
      ConditionExpression: "attribute_not_exists(userId)",
    }));

    return res.status(200).json({ ok: true, status });
  } catch (e: any) {
    // Si falla la condición de unicidad, responde 409
    if (String(e?.message || "").includes("ConditionalCheckFailed")) {
      return res.status(409).json({ error: "Ya tienes un perfil de mentor." });
    }
    console.error("apply mentor error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
