// pages/api/marketplace/services/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  QueryCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ddb,
  TABLE_MARKETPLACE_SERVICES as TABLE_SRV,
  TABLE_MARKETPLACE_PROVIDERS as TABLE_PROV,
} from "../../../../lib/dynamodb";
import { randomUUID } from "crypto";

const MAX_SERVICES_PER_PROVIDER = 10;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TABLE_SRV || !TABLE_PROV) {
    return res.status(500).json({ error: "TABLE env missing" });
  }

  // ───────────────── GET (listar por provider) ─────────────────
  if (req.method === "GET") {
    try {
      const { providerId = "", limit = "50", countOnly = "0" } = req.query as any;
      if (!providerId) return res.status(400).json({ error: "providerId required" });

      if (countOnly === "1") {
        const cnt = await ddb.send(
          new QueryCommand({
            TableName: TABLE_SRV,
            KeyConditionExpression: "#p = :p",
            ExpressionAttributeNames: { "#p": "providerId" },
            ExpressionAttributeValues: { ":p": providerId },
            Select: "COUNT",
          })
        );
        return res.status(200).json({ count: cnt.Count || 0, limit: MAX_SERVICES_PER_PROVIDER });
      }

      const out = await ddb.send(
        new QueryCommand({
          TableName: TABLE_SRV,
          KeyConditionExpression: "#p = :p",
          ExpressionAttributeNames: { "#p": "providerId" },
          ExpressionAttributeValues: { ":p": providerId },
          Limit: Math.min(parseInt(limit) || 50, 100),
        })
      );
      return res.status(200).json({ items: out.Items || [] });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message || "list services error" });
    }
  }

  // ───────────────── POST (crear) ─────────────────
  if (req.method === "POST") {
    try {
      const userId = (req.headers["x-user-id"] as string) || "";
      if (!userId) return res.status(401).json({ error: "missing x-user-id" });

      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const providerId: string = String(body.providerId || "");
      if (!providerId) return res.status(400).json({ error: "providerId required" });

      // existe provider y pertenece al usuario
      const prov = await ddb.send(
        new GetCommand({ TableName: TABLE_PROV, Key: { providerId } })
      );
      if (!prov.Item) return res.status(404).json({ error: "provider not found" });
      if ((prov.Item as any).userId !== userId) {
        return res.status(403).json({ error: "forbidden" });
      }

      // límite por proveedor
      const countRes = await ddb.send(
        new QueryCommand({
          TableName: TABLE_SRV,
          KeyConditionExpression: "#p = :p",
          ExpressionAttributeNames: { "#p": "providerId" },
          ExpressionAttributeValues: { ":p": providerId },
          Select: "COUNT",
        })
      );
      if ((countRes.Count || 0) >= MAX_SERVICES_PER_PROVIDER) {
        return res
          .status(400)
          .json({ error: `Límite alcanzado: máximo ${MAX_SERVICES_PER_PROVIDER} servicios por proveedor.` });
      }

      // ⚠️ La GSI category-createdAt-index no acepta string vacío
      const safeCategory: string = (body.category || "").trim() || "General";

      const now = Date.now();
      const item = {
        providerId,
        serviceId: body.serviceId || randomUUID(),
        title: (body.title || "").slice(0, 120),
        description: body.description || "",
        category: safeCategory,              // <- nunca vacío
        tags: Array.isArray(body.tags) ? body.tags : [],
        priceFrom: Number(body.priceFrom || 0),
        priceUnit: body.priceUnit || "proyecto",
        deliveryTimeDays: Number(body.deliveryTimeDays || 0),
        images: Array.isArray(body.images) ? body.images : [],
        active: body.active ?? true,
        createdAt: now,
        updatedAt: now,
      };

      await ddb.send(new PutCommand({ TableName: TABLE_SRV, Item: item }));

      // 🔁 actualizar agregados del proveedor
      await ddb.send(
        new UpdateCommand({
          TableName: TABLE_PROV,
          Key: { providerId },
          UpdateExpression:
            "SET updatedAt = :now, servicesCount = if_not_exists(servicesCount, :zero) + :one, " +
            "servicesSummary = list_append(if_not_exists(servicesSummary, :empty), :title)",
          ExpressionAttributeValues: {
            ":now": now,
            ":zero": 0,
            ":one": 1,
            ":empty": [],
            ":title": [item.title],
          },
        })
      );

      return res.status(200).json({ item });
    } catch (e: any) {
      console.error(e);
      return res.status(500).json({ error: e.message || "create service error" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).end();
}
