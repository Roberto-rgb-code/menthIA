import type { NextApiRequest, NextApiResponse } from "next";
import { buildAuthUrl } from "../../../../lib/google-calendar";
import { requireUserId } from "../../util/getUserId";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = requireUserId(req, res);
  if (!userId) return;
  try {
    const url = buildAuthUrl(userId);
    // puedes redirigir directamente o devolver JSON
    // return res.redirect(url);
    return res.status(200).json({ url });
  } catch (e: any) {
    console.error("oauth start error", e);
    return res.status(500).json({ error: "No se pudo iniciar OAuth" });
  }
}
