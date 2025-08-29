// pages/api/util/getUserId.ts
import type { NextApiRequest, NextApiResponse } from "next";

export function getUserIdFromRequest(req: NextApiRequest): string | null {
  const h = req.headers["x-user-id"];
  if (typeof h === "string" && h.trim()) return h.trim();
  if (Array.isArray(h) && h[0]) return h[0].trim();
  if (req.body?.userId && typeof req.body.userId === "string") return req.body.userId.trim();
  return null;
}

export function requireUserId(req: NextApiRequest, res: NextApiResponse): string | null {
  const uid = getUserIdFromRequest(req);
  if (!uid) {
    res.status(401).json({ error: "Auth requerida: envía header x-user-id" });
    return null;
  }
  return uid;
}
