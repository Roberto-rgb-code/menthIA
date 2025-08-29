// pages/api/payments/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Puedes cambiar por: checkout.sessions.list / paymentIntents.list / charges.list, etc.
    const { limit = "10" } = req.query;
    const paymentIntents = await stripe.paymentIntents.list({
      limit: Number(limit) || 10,
    });

    return res.status(200).json({ items: paymentIntents.data });
  } catch (err: any) {
    console.error("stripe list error", err);
    return res.status(500).json({ error: err.message || "Stripe error" });
  }
}
