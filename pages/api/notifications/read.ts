// pages/api/notifications/read.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NOTIFS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

type BodyByIds = { ids?: string[] };
type BodyByBefore = { before?: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH" && req.method !== "POST") return res.status(405).end();

  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const { ids = [], before } = (req.body || {}) as BodyByIds & BodyByBefore;

    let targetIds: string[] = ids;

    // Si llegó `before`, buscamos notificaciones del usuario con createdAt <= before
    if (!targetIds.length && before) {
      // Trae en bloques (p.ej. 100) hasta alcanzar la fecha 'before'
      let lastKey: any = undefined;
      const toMark: any[] = [];
      do {
        const q = await ddb.send(new QueryCommand({
          TableName: TABLE_NOTIFS,
          IndexName: "byUserIdCreatedAt",
          KeyConditionExpression: "userId = :u",
          ExpressionAttributeValues: { ":u": userId },
          ScanIndexForward: true, // ascendente para parar cuando sobrepasemos 'before'
          Limit: 100,
          ExclusiveStartKey: lastKey,
        }));
        const items = q.Items || [];
        for (const it of items) {
          if (String(it.createdAt) <= before) toMark.push(it);
        }
        lastKey = q.LastEvaluatedKey;
        // Cortamos si el último ya supera 'before'
        if (items.length && String(items[items.length - 1].createdAt) > before) break;
      } while (lastKey);

      targetIds = toMark.map((n) => String(n.id));
    }

    if (!targetIds.length) {
      return res.status(200).json({ ok: true, updated: 0 });
    }

    let updated = 0;
    for (const id of targetIds) {
      try {
        // Seguridad mínima: solo marcar propias. Para eso necesitas el userId en el item.
        await ddb.send(new UpdateCommand({
          TableName: TABLE_NOTIFS,
          Key: { id },
          UpdateExpression: "SET #r = :true",
          ConditionExpression: "userId = :u",
          ExpressionAttributeNames: { "#r": "read" },
          ExpressionAttributeValues: { ":true": true, ":u": userId },
        }));
        updated++;
      } catch (e: any) {
        // Si no cumple condición (no es tuya) o no existe, lo saltamos
        // console.warn("skip mark read", id, e?.name);
      }
    }

    return res.status(200).json({ ok: true, updated });
  } catch (e: any) {
    console.error("notifications read error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
