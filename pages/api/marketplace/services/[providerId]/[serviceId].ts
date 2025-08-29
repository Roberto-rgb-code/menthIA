// pages/api/marketplace/services/[providerId]/[serviceId].ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  DeleteCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import {
  ddb,
  TABLE_MARKETPLACE_SERVICES as TABLE_SRV,
  TABLE_MARKETPLACE_PROVIDERS as TABLE_PROV,
} from "../../../../../lib/dynamodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const providerId = String(req.query.providerId || "");
  const serviceId  = String(req.query.serviceId  || "");

  if (!providerId || !serviceId) {
    return res.status(400).json({ error: "missing providerId/serviceId" });
  }

  if (req.method === "OPTIONS") return res.status(200).end();

  // ───────────────── DELETE ─────────────────
  if (req.method === "DELETE") {
    try {
      const userId = (req.headers["x-user-id"] as string) || "";
      if (!userId) return res.status(401).json({ error: "missing x-user-id" });

      // provider del usuario
      const p = await ddb.send(
        new GetCommand({ TableName: TABLE_PROV, Key: { providerId } })
      );
      if (!p.Item) return res.status(404).json({ error: "provider not found" });
      if ((p.Item as any).userId !== userId) return res.status(403).json({ error: "forbidden" });

      // obtener servicio
      const s = await ddb.send(
        new GetCommand({ TableName: TABLE_SRV, Key: { providerId, serviceId } })
      );
      if (!s.Item) return res.status(404).json({ error: "service not found" });

      // eliminar
      await ddb.send(
        new DeleteCommand({
          TableName: TABLE_SRV,
          Key: { providerId, serviceId },
          ConditionExpression: "attribute_exists(serviceId)",
        })
      );

      // 🔁 decrementar agregado
      await ddb.send(
        new UpdateCommand({
          TableName: TABLE_PROV,
          Key: { providerId },
          UpdateExpression:
            "SET updatedAt = :now, servicesCount = if_not_exists(servicesCount, :zero) - :one",
          ExpressionAttributeValues: {
            ":now": Date.now(),
            ":zero": 0,
            ":one": 1,
          },
        })
      );

      return res.status(200).json({
        ok: true,
        deleted: { providerId, serviceId, title: (s.Item as any)?.title || null },
      });
    } catch (e: any) {
      if (e?.name === "ConditionalCheckFailedException") {
        return res.status(409).json({ error: "service already removed" });
      }
      console.error("delete service error", e);
      return res.status(500).json({ error: e.message || "delete service error" });
    }
  }

  // ───────────────── GET ─────────────────
  if (req.method === "GET") {
    try {
      const s = await ddb.send(
        new GetCommand({ TableName: TABLE_SRV, Key: { providerId, serviceId } })
      );
      if (!s.Item) return res.status(404).json({ error: "service not found" });
      return res.status(200).json({ item: s.Item });
    } catch (e: any) {
      console.error("get service error", e);
      return res.status(500).json({ error: e.message || "get service error" });
    }
  }

  res.setHeader("Allow", "GET, DELETE, OPTIONS");
  return res.status(405).end();
}
