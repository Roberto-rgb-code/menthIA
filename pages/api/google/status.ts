// pages/api/google/status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_GOOGLE_TOKENS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const g = await ddb.send(
      new GetCommand({
        TableName: TABLE_GOOGLE_TOKENS,
        Key: { userId },
      })
    );
    return res.status(200).json({ connected: !!g.Item });
  } catch (e: any) {
    // Si la tabla no existe, devolvemos “no conectado” en vez de 500
    if (e?.name === "ResourceNotFoundException") {
      console.warn("[google/status] Tabla no encontrada:", TABLE_GOOGLE_TOKENS);
      return res.status(200).json({ connected: false });
    }
    console.error("status error", e);
    return res.status(500).json({ error: "Error consultando estado" });
  }
}
