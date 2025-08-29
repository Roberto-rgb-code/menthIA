import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_AVAIL } from "../../../lib/dynamodb";

// Query por día:
//   GET /api/availability/list?mentorId=UID&date=YYYY-MM-DD
// Query por mes (marca días con slots):
//   GET /api/availability/list?mentorId=UID&month=YYYY-MM  (ej. 2025-08)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { mentorId, date, month } = req.query as { mentorId?: string; date?: string; month?: string };
  if (!mentorId) return res.status(400).json({ error: "mentorId requerido" });

  try {
    if (date) {
      const r = await ddb.send(new GetCommand({
        TableName: TABLE_AVAIL,
        Key: { userId: mentorId, date },
      }));
      const item = r.Item || { userId: mentorId, date, slots: [] };
      // filtra slots libres
      item.slots = (item.slots || []).filter((s: any) => !s.booked);
      return res.status(200).json({ date, slots: item.slots });
    }

    if (month) {
      const [y, m] = month.split("-").map(Number);
      if (!y || !m) return res.status(400).json({ error: "month inválido" });

      // aproximación simple: traemos +/- 45 días alrededor y filtramos por prefijo
      const from = new Date(y, m - 1, 1);
      const to = new Date(y, m, 0); // fin de mes
      // Dynamo necesita key exacta; como la PK es userId y SK=date, hacemos Query por userId y filtramos rango de strings
      const q = await ddb.send(new QueryCommand({
        TableName: TABLE_AVAIL,
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": mentorId },
      }));

      const daysWithSlots = new Set<string>();
      for (const it of (q.Items || [])) {
        const d = it.date as string;
        const dt = new Date(d + "T00:00:00");
        if (dt >= from && dt <= to && Array.isArray(it.slots) && it.slots.some((s: any) => !s.booked)) {
          daysWithSlots.add(d);
        }
      }

      return res.status(200).json({ month, days: Array.from(daysWithSlots).sort() });
    }

    return res.status(400).json({ error: "Provee date=YYYY-MM-DD o month=YYYY-MM" });
  } catch (e: any) {
    console.error("availability list error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
