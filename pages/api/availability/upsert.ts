import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_AVAIL } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

// Body esperado:
// {
//   "userId": "MENTOR_UID",
//   "date": "2025-08-10",
//   "slots": [
//     {"startISO":"2025-08-10T16:00:00", "endISO":"2025-08-10T16:30:00"},
//     ...
//   ]
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const callerId = requireUserId(req, res);
  if (!callerId) return;

  try {
    const { userId, date, slots } = req.body || {};
    if (!userId || !date || !Array.isArray(slots)) {
      return res.status(400).json({ error: "Faltan campos: userId, date, slots[]" });
    }
    // (opcional) exigir que el mentor mismo cargue su disponibilidad:
    // if (callerId !== userId) return res.status(403).json({ error: "No autorizado" });

    // normaliza estructura
    const cleanSlots = slots.map((s: any) => ({
      startISO: String(s.startISO),
      endISO: String(s.endISO),
      booked: !!s.booked,
    }));

    await ddb.send(new PutCommand({
      TableName: TABLE_AVAIL,
      Item: {
        userId,
        date,              // PK+SK
        slots: cleanSlots, // array
        updatedAt: Date.now(),
      },
    }));

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("availability upsert error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
