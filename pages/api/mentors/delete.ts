// pages/api/mentors/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  DeleteCommand,
  QueryCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_PROFILES, TABLE_AVAIL } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE" && req.method !== "POST") return res.status(405).end();

  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    // 1) Borra el perfil en MentorAppProfiles
    await ddb.send(new DeleteCommand({
      TableName: TABLE_PROFILES,
      Key: { userId },
    }));

    // 2) Borra disponibilidad en MentorAvailability (PK: userId, SK: date)
    try {
      const q = await ddb.send(new QueryCommand({
        TableName: TABLE_AVAIL,
        KeyConditionExpression: "userId = :u",
        ExpressionAttributeValues: { ":u": userId },
      }));
      const items = q.Items || [];
      if (items.length) {
        for (const group of chunk(items, 25)) {
          await ddb.send(new BatchWriteCommand({
            RequestItems: {
              [TABLE_AVAIL]: group.map((it: any) => ({
                DeleteRequest: { Key: { userId: it.userId, date: it.date } },
              })),
            },
          }));
        }
      }
    } catch (e) {
      console.warn("delete availability warn:", e);
    }

    // NOTA: Si quieres cancelar citas futuras, lo añadimos luego.
    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("delete mentor error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
