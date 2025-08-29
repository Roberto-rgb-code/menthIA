// pages/api/availability/set.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_AVAIL } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { date, slots, tz } = req.body || {};
    if (!date || !Array.isArray(slots)) return res.status(400).json({ error: "date y slots requeridos" });

    await ddb.send(new PutCommand({
      TableName: TABLE_AVAIL,
      Item: {
        userId,
        date,
        slots,
        tz: tz || "America/Mexico_City",
        updatedAt: new Date().toISOString(),
      },
    }));

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("availability set error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
