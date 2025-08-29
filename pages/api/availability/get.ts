// pages/api/availability/get.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_AVAIL } from "../../../lib/dynamodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { mentorId, date } = req.query as { mentorId?: string; date?: string };
    if (!mentorId || !date) return res.status(400).json({ error: "mentorId y date requeridos" });

    const data = await ddb.send(new GetCommand({
      TableName: TABLE_AVAIL,
      Key: { userId: mentorId, date },
    }));

    return res.status(200).json({ item: data.Item || null });
  } catch (e: any) {
    console.error("availability get error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
