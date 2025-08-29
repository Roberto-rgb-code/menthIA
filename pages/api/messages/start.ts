import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NOTIFS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const fromUserId = requireUserId(req, res);
  if (!fromUserId) return;

  try {
    const { toUserId, body } = req.body || {};
    if (!toUserId || !body) return res.status(400).json({ error: "toUserId y body requeridos" });

    // Minimal: guardamos como notificación tipo "message"
    const now = new Date().toISOString();
    const id = `${toUserId}#${now}`;

    await ddb.send(new PutCommand({
      TableName: TABLE_NOTIFS,
      Item: {
        id,
        userId: toUserId,     // receptor verá la notif
        createdAt: now,
        type: "message",
        title: "Nuevo mensaje",
        body,
        read: false,
        meta: { fromUserId },
      },
    }));

    // (Opcional) duplicar el mensaje en otra tabla de “threads” si quieres historial.

    return res.status(200).json({ ok: true });
  } catch (e:any) {
    console.error("messages/start error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
