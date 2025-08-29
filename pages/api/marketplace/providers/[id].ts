// pages/api/marketplace/providers/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, QueryCommand, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_MARKETPLACE_PROVIDERS as TABLE } from "../../../../lib/dynamodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = String(req.query.id || "");
  if (!id) return res.status(400).json({ error: "missing id/slug" });

  if (req.method === "GET") {
    try {
      // intenta como providerId
      const byId = await ddb.send(new GetCommand({ TableName: TABLE, Key: { providerId: id } }));
      if (byId.Item) return res.status(200).json({ item: byId.Item });

      // por slug (GSI)
      const out = await ddb.send(new QueryCommand({
        TableName: TABLE,
        IndexName: "slug-index",
        KeyConditionExpression: "#s = :s",
        ExpressionAttributeNames: { "#s": "slug" },
        ExpressionAttributeValues: { ":s": id },
        Limit: 1,
      }));
      const item = out.Items?.[0];
      if (!item) return res.status(404).json({ error: "not found" });
      return res.status(200).json({ item });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message || "get error" });
    }
  }

  if (req.method === "PUT") {
    try {
      const userId = (req.headers["x-user-id"] as string) || "";
      if (!userId) return res.status(401).json({ error: "missing x-user-id" });
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      const cur = await ddb.send(new GetCommand({ TableName: TABLE, Key: { providerId: id } }));
      if (!cur.Item) return res.status(404).json({ error: "not found" });
      if (cur.Item.userId !== userId) return res.status(403).json({ error: "forbidden" });

      const item = { ...cur.Item, ...body, updatedAt: Date.now() };
      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return res.status(200).json({ item });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message || "update error" });
    }
  }

  if (req.method === "DELETE") {
    try {
      const userId = (req.headers["x-user-id"] as string) || "";
      if (!userId) return res.status(401).json({ error: "missing x-user-id" });

      const cur = await ddb.send(new GetCommand({ TableName: TABLE, Key: { providerId: id } }));
      if (!cur.Item) return res.status(404).json({ error: "not found" });
      if (cur.Item.userId !== userId) return res.status(403).json({ error: "forbidden" });

      await ddb.send(new DeleteCommand({ TableName: TABLE, Key: { providerId: id } }));
      return res.status(200).json({ ok: true });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message || "delete error" });
    }
  }

  return res.status(405).end();
}
