// pages/api/marketplace/providers/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { QueryCommand, PutCommand, ScanCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_MARKETPLACE_PROVIDERS as TABLE } from "../../../../lib/dynamodb";

function now() { return Date.now(); }
function slugify(v: string) {
  return (v || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Decodificador robusto para cursor en base64 (sin depender de Buffer)
function decodeB64ToJSON<T = any>(b64?: string): T | undefined {
  if (!b64) return undefined;
  try {
    if (typeof Buffer !== "undefined") {
      return JSON.parse(Buffer.from(String(b64), "base64").toString("utf8"));
    }
    // Edge / browser fallback
    if (typeof atob !== "undefined") {
      // atob -> string binaria, escapamos a UTF-8
      // eslint-disable-next-line no-undef
      const txt = decodeURIComponent(escape(atob(String(b64))));
      return JSON.parse(txt);
    }
  } catch { /* ignore */ }
  return undefined;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!TABLE) return res.status(500).json({ error: "TABLE env missing" });

  // ───────────────── GET ─────────────────
  if (req.method === "GET") {
    try {
      const {
        q = "", type = "", country = "", area = "",
        minRating = "0", limit = "30", cursor, withServicesOnly = "0"
      } = req.query as any;

      const lim = Math.min(parseInt(limit) || 30, 50);
      const filters = {
        q: String(q).trim().toLowerCase(),
        type,
        country,
        area,
        minRating: Number(minRating) || 0,
      };
      const onlyWithServices = withServicesOnly === "1";

      let indexName = "";
      let attrName = "";
      let attrVal: any = undefined;

      if (filters.type)         { indexName = "type-rating-index";    attrName = "type";        attrVal = filters.type; }
      else if (filters.country) { indexName = "country-rating-index"; attrName = "country";     attrVal = filters.country; }
      else if (filters.area)    { indexName = "area-rating-index";    attrName = "primaryArea"; attrVal = filters.area; }

      const startKey = decodeB64ToJSON(cursor);

      let items: any[] = [];
      let LastEvaluatedKey;

      if (indexName) {
        const out = await ddb.send(new QueryCommand({
          TableName: TABLE,
          IndexName: indexName,
          KeyConditionExpression: "#pk = :pk",
          ExpressionAttributeNames: { "#pk": attrName },
          ExpressionAttributeValues: { ":pk": attrVal },
          ScanIndexForward: false,
          Limit: lim,
          ExclusiveStartKey: startKey,
        }));
        items = out.Items || [];
        LastEvaluatedKey = out.LastEvaluatedKey;
      } else {
        const out = await ddb.send(new ScanCommand({
          TableName: TABLE,
          Limit: lim,
          ExclusiveStartKey: startKey,
        }));
        items = out.Items || [];
        LastEvaluatedKey = out.LastEvaluatedKey;
        items.sort((a, b) => (b.ratingAvg || 0) - (a.ratingAvg || 0));
      }

      items = items.filter((p: any) => {
        if (p.status && p.status !== "active") return false;
        if (onlyWithServices && (p.servicesCount || 0) <= 0) return false; // 👈
        if (filters.minRating && (p.ratingAvg || 0) < filters.minRating) return false;
        if (filters.q) {
          const blob = `${p.nameLower || ""} ${p.headline || ""} ${(p.keywords || []).join(" ")} ${(p.servicesSummary || []).join(" ")}`.toLowerCase();
          if (!blob.includes(filters.q)) return false;
        }
        return true;
      });

      return res.status(200).json({
        items,
        cursor: LastEvaluatedKey
          ? (typeof Buffer !== "undefined"
              ? Buffer.from(JSON.stringify(LastEvaluatedKey), "utf8").toString("base64")
              // Edge/browser fallback (no se usa normalmente, pero por si acaso)
              : (typeof btoa !== "undefined" ? btoa(unescape(encodeURIComponent(JSON.stringify(LastEvaluatedKey)))) : undefined)
            )
          : undefined,
      });
    } catch (e: any) {
      console.error("providers/index GET error:", e);
      return res.status(500).json({ error: e?.message || "list error" });
    }
  }

  // ───────────────── POST (upsert perfil) ─────────────────
  if (req.method === "POST") {
    try {
      const userId = (req.headers["x-user-id"] as string) || "";
      if (!userId) return res.status(401).json({ error: "missing x-user-id" });

      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      const providerId: string = body.providerId || userId;
      const name: string = body.name || "";

      const prev = await ddb.send(new GetCommand({ TableName: TABLE, Key: { providerId } }));

      const item = {
        ...(prev.Item || {}),
        providerId,
        userId,
        status: body.status ?? (prev.Item as any)?.status ?? "active",
        type: body.type ?? (prev.Item as any)?.type ?? "consultor",
        name,
        slug: body.slug || (prev.Item as any)?.slug || slugify(name) || providerId,
        headline: body.headline ?? (prev.Item as any)?.headline ?? "",
        country: body.country ?? (prev.Item as any)?.country ?? "",
        city: body.city ?? (prev.Item as any)?.city ?? "",
        languages: body.languages ?? (prev.Item as any)?.languages ?? [],
        expertiseAreas: body.expertiseAreas ?? (prev.Item as any)?.expertiseAreas ?? [],
        industries: body.industries ?? (prev.Item as any)?.industries ?? [],
        priceRange: body.priceRange ?? (prev.Item as any)?.priceRange ?? null,
        ratingAvg: (prev.Item as any)?.ratingAvg ?? 0,
        ratingCount: (prev.Item as any)?.ratingCount ?? 0,
        logoUrl: body.logoUrl ?? (prev.Item as any)?.logoUrl ?? "",
        coverUrl: body.coverUrl ?? (prev.Item as any)?.coverUrl ?? "",
        bio: body.bio ?? (prev.Item as any)?.bio ?? "",
        servicesSummary: (prev.Item as any)?.servicesSummary ?? [],
        servicesCount: (prev.Item as any)?.servicesCount ?? 0,
        nameLower: (name || "").toLowerCase(),
        primaryArea: body.primaryArea || (body.expertiseAreas?.[0] || (prev.Item as any)?.primaryArea || ""),
        keywords: body.keywords ?? (prev.Item as any)?.keywords ?? [],
        createdAt: (prev.Item as any)?.createdAt || now(),
        updatedAt: now(),
      };

      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return res.status(200).json({ item });
    } catch (e: any) {
      console.error("providers/index POST error:", e);
      return res.status(500).json({ error: e?.message || "upsert error" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method Not Allowed" });
  
}
