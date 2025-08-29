import type { NextApiRequest, NextApiResponse } from "next";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_MARKETPLACE_PROVIDERS as TABLE } from "../../../../lib/dynamodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "GET") { res.setHeader("Allow", "GET"); return res.status(405).end(); }
    if (!TABLE) return res.status(500).json({ error: "TABLE env missing" });

    res.setHeader("Cache-Control", "no-store");

    const userId = (req.headers["x-user-id"] as string) || "";
    if (!userId) return res.status(401).json({ error: "missing x-user-id" });

    // 'type' es palabra reservada: usa alias #type
    const out = await ddb.send(new ScanCommand({
      TableName: TABLE,
      Limit: 200,
      FilterExpression: "#uid = :u",
      ExpressionAttributeNames: { "#uid": "userId", "#type": "type", "#name": "name" },
      ExpressionAttributeValues: { ":u": userId },
      ProjectionExpression:
        "providerId, userId, #name, headline, #type, country, languages, expertiseAreas, logoUrl, coverUrl, ratingAvg, ratingCount, createdAt, updatedAt, slug",
    }));

    const items = out.Items || [];
    return res.status(200).json({ item: items[0] || null });
  } catch (e:any) {
    console.error("providers/mine error", e);
    return res.status(500).json({ error: e?.message || "providers/mine error" });
  }
}
