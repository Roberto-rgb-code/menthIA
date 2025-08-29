// pages/api/payments/session-status.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session_id = (req.query.session_id as string) || "";
    if (!session_id) return res.status(400).json({ error: "session_id requerido" });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "line_items"],
    });

    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      session.mode === "subscription";

    return res.status(200).json({
      paid,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null,
      metadata: session.metadata ?? {},
      mode: session.mode,
    });
  } catch (e: any) {
    console.error("session-status error", e);
    return res.status(500).json({ error: e.message || "Error consultando sesión" });
  }
}
