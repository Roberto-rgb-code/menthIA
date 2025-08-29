// pages/api/notifications/unread-count.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NOTIFS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    // En PAY_PER_REQUEST y volúmenes moderados, contar en cliente está bien.
    // Si necesitas ultra-perf, mantén un contador materializado.
    let lastKey: any = undefined;
    let count = 0;
    do {
      const q = await ddb.send(new QueryCommand({
        TableName: TABLE_NOTIFS,
        IndexName: "byUserIdCreatedAt",
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": userId },
        ProjectionExpression: "id, #r",
        ExpressionAttributeNames: { "#r": "read" },
        Limit: 100,
        ExclusiveStartKey: lastKey,
      }));
      for (const it of q.Items || []) {
        if (!it.read) count++;
      }
      lastKey = q.LastEvaluatedKey;
    } while (lastKey);

    return res.status(200).json({ unread: count });
  } catch (e: any) {
    console.error("notifications unread-count error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
