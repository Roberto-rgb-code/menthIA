// pages/api/mentors/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NOTIFS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const fromUserId = requireUserId(req, res);
  if (!fromUserId) return;

  try {
    const { mentorId, message } = req.body || {};
    if (!mentorId || !message) return res.status(400).json({ error: "mentorId y message requeridos" });

    const now = new Date().toISOString();

    // Notif al mentor
    try {
      await ddb.send(new PutCommand({
        TableName: TABLE_NOTIFS,
        Item: {
          id: `${mentorId}#${now}`,
          userId: mentorId,
          createdAt: now,
          type: "contact_message",
          title: "Nuevo contacto",
          body: message,
          meta: { fromUserId },
          read: false,
        },
      }));
    } catch (e: any) {
      if (e?.name === "ResourceNotFoundException") {
        console.warn("[notifications] Tabla no existe, omitiendo soft-fail");
      } else {
        throw e;
      }
    }

    // (Opcional) Notif al remitente como confirmación
    try {
      await ddb.send(new PutCommand({
        TableName: TABLE_NOTIFS,
        Item: {
          id: `${fromUserId}#${now}`,
          userId: fromUserId,
          createdAt: now,
          type: "contact_sent",
          title: "Mensaje enviado",
          body: "Tu mensaje fue enviado al mentor.",
          meta: { mentorId },
          read: false,
        },
      }));
    } catch {}

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("contact mentor error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
