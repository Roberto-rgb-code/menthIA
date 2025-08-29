import type { NextApiRequest, NextApiResponse } from "next";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NOTIFS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

// POST /api/notifications/mark-read
// body: { ids: string[] }  // ids = ["<userId>#<createdAtISO>", ...]
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids requerido" });
    }

    // Los IDs se generaron como `${userId}#${createdAt}`
    // Split para obtener createdAt
    const ops = ids.map(async (fullId: string) => {
      const [uid, createdAt] = String(fullId).split("#");
      if (uid !== userId || !createdAt) return;
      await ddb.send(
        new UpdateCommand({
          TableName: TABLE_NOTIFS,
          Key: { userId, createdAt },
          UpdateExpression: "SET #r = :true",
          ExpressionAttributeNames: { "#r": "read" },
          ExpressionAttributeValues: { ":true": true },
        })
      );
    });

    await Promise.all(ops);
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("notifications mark-read error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
