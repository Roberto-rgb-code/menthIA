// pages/api/mentors/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_PROFILES } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const r = await ddb.send(new GetCommand({ TableName: TABLE_PROFILES, Key: { userId } }));
    return res.status(200).json({ item: r.Item || null });
  } catch (e) {
    console.error("GET /api/mentors/me error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
