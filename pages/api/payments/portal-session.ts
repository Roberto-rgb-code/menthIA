// pages/api/payments/portal-session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { requireUserId } from "../util/getUserId";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const uid = requireUserId(req, res);
  if (!uid) return;

  try {
    const { returnUrl } = req.body || {};
    // Obtenemos email del usuario (Firebase Admin)
    const u = await getAuth().getUser(uid);
    const email = u.email;
    if (!email) return res.status(400).json({ error: "Tu usuario no tiene email" });

    // Buscar customer por email
    const found = await stripe.customers.list({ email, limit: 1 });
    let customer = found.data[0];

    // Si no existe, lo creamos
    if (!customer) {
      customer = await stripe.customers.create({
        email,
        metadata: { uid },
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || `${req.headers.origin}/dashboard/pagos`,
    });

    res.status(200).json({ url: session.url });
  } catch (e: any) {
    console.error("portal-session error", e);
    res.status(500).json({ error: e.message || "Stripe error" });
  }
}
