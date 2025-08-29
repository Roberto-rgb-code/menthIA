// pages/api/notifications/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ddb, TABLE_NOTIFS } from "@/lib/dynamodb";
import { QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const GSI = "byUserIdCreatedAt"; // si lo creaste, úsalo; si no, hará fallback a Scan

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const userId =
      (req.headers["x-user-id"] as string) ||
      (Array.isArray(req.headers["x-user-id"]) ? req.headers["x-user-id"][0] : "");

    if (!userId) {
      return res.status(401).json({ error: "Auth requerida: envía header x-user-id" });
    }

    const limit = Math.min(Number(req.query.limit || 30), 100);

    try {
      // Intento con GSI (recomendado en prod)
      const q = await ddb.send(
        new QueryCommand({
          TableName: TABLE_NOTIFS,
          IndexName: GSI,
          KeyConditionExpression: "userId = :u",
          ExpressionAttributeValues: { ":u": userId },
          ScanIndexForward: false, // recientes primero
          Limit: limit,
        })
      );
      return res.status(200).json({ items: q.Items || [] });
    } catch (e: any) {
      // Fallback sin GSI (dev): Scan + filtro
      const scan = await ddb.send(
        new ScanCommand({
          TableName: TABLE_NOTIFS,
          FilterExpression: "userId = :u",
          ExpressionAttributeValues: { ":u": userId },
          Limit: 200,
        })
      );
      const items = (scan.Items || [])
        .sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, limit);
      return res.status(200).json({ items });
    }
  } catch (e: any) {
    console.error("notifications list error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
