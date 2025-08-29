// pages/api/stripe/webhook.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export const config = {
  api: { bodyParser: false }, // Stripe necesita raw body
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  const rawBody = Buffer.concat(chunks);

  const sig = req.headers["stripe-signature"]!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata || {};

      // Si es mentoría, crear la reserva
      if (metadata.kind?.startsWith("mentoria")) {
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": metadata.mentorId },
          body: JSON.stringify({
            mentorId: metadata.mentorId,
            startISO: metadata.startISO,
            endISO: metadata.endISO,
            menteeEmail: session.customer_email,
            notes: `Pago confirmado en Stripe. Ref: ${session.id}`,
          }),
        });
      }

      // Aquí podrías guardar en DynamoDB el pago también
      console.log("Pago confirmado:", session.id, metadata.kind);
    }

    res.json({ received: true });
  } catch (e: any) {
    console.error("Webhook handler error", e);
    res.status(500).send("Webhook handler failed");
  }
}
