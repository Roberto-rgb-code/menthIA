// pages/api/mentors/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { QueryCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_PROFILES } from "../../../lib/dynamodb";

const PROFILES_GSI_NAME = process.env.DYNAMODB_PROFILES_GSI_NAME || "GSI1"; // por si cambias el nombre

function norm(s?: string) { return (s || "").trim().toLowerCase(); }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const q = norm(String(req.query.q || ""));
    const country = norm(String(req.query.country || ""));
    const area = norm(String(req.query.area || ""));
    const includeMe = String(req.query.includeMe || "false") === "true";

    let items: any[] = [];

    // 1) INTENTO con GSI (roleStatus = "mentor#approved")
    try {
      const base = await ddb.send(new QueryCommand({
        TableName: TABLE_PROFILES,
        IndexName: PROFILES_GSI_NAME,       // GSI1 esperado: PK = roleStatus (String)
        KeyConditionExpression: "#rs = :rs",
        ExpressionAttributeNames: { "#rs": "roleStatus" },
        ExpressionAttributeValues: { ":rs": "mentor#approved" },
      }));
      items = base.Items || [];
    } catch (e: any) {
      // 2) FALLBACK sin GSI → Scan con filtro (para dev)
      const msg = String(e?.message || e);
      if (msg.includes("does not have the specified index") || e?.name === "ValidationException") {
        const scan = await ddb.send(new ScanCommand({
          TableName: TABLE_PROFILES,
          FilterExpression: "#role = :r AND #st = :s",
          ExpressionAttributeNames: { "#role": "role", "#st": "status" },
          ExpressionAttributeValues: { ":r": "mentor", ":s": "approved" },
        }));
        items = scan.Items || [];
      } else {
        throw e; // error real distinto
      }
    }

    // 3) Filtros en memoria
    if (country) items = items.filter(it => norm(it.country) === country);
    if (area) {
      items = items.filter(
        it => Array.isArray(it.areasInteres) && it.areasInteres.some((a: string) => norm(a) === area)
      );
    }
    if (q) {
      items = items.filter(it => {
        const fields = [
          norm(it.fullName),
          norm(it.acercaDeMi),
          ...(Array.isArray(it.areasInteres) ? it.areasInteres.map((a: string) => norm(a)) : []),
        ];
        return fields.some(f => f.includes(q));
      });
    }

    // 4) includeMe: agrega tu propia ficha aunque esté pending/rejected
    if (includeMe) {
      const h = req.headers["x-user-id"];
      const userId = typeof h === "string" ? h : Array.isArray(h) ? h[0] : "";
      if (userId) {
        const me = await ddb.send(new GetCommand({ TableName: TABLE_PROFILES, Key: { userId } }));
        if (me.Item && me.Item.role === "mentor") {
          const already = items.find((x) => x.userId === userId);
          const self = { ...me.Item, __isSelf: true };
          if (!already) items = [self, ...items];
          else Object.assign(already, self);
        }
      }
    }

    return res.status(200).json({ items });
  } catch (e: any) {
    console.error("GET /api/mentors error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
