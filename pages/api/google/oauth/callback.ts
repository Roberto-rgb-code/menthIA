import type { NextApiRequest, NextApiResponse } from "next";
import { exchangeCodeAndStoreTokens } from "../../../../lib/google-calendar";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) return res.status(400).send("Missing code/state");
    await exchangeCodeAndStoreTokens(code, state);
    // redirige a la vista de mentoría
    res.writeHead(302, { Location: "/dashboard/mentoria?google=connected" }).end();
  } catch (e: any) {
    console.error("oauth callback error", e);
    res.writeHead(302, { Location: "/dashboard/mentoria?google=error" }).end();
  }
}
