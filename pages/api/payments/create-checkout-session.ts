// pages/api/payments/create-checkout-session.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// Catálogo simple: todos caen al mismo success/cancel
const PRICE_TABLE: Record<
  string,
  { priceId?: string; name: string; description?: string; unitAmount?: number; currency?: string }
> = {
  diagnostico_profundo: {
    // priceId: process.env.STRIPE_PRICE_DIAG_PROFUNDO,
    name: "Diagnóstico Profundo Empresarial",
    description: "Análisis consultivo 360° con plan 30-60-90 e indicadores.",
    unitAmount: Number(process.env.NEXT_PUBLIC_PRICE_DIAG_PROFUNDO_CENTS || 49900),
    currency: "mxn",
  },
  mentoria: {
    // priceId: process.env.STRIPE_PRICE_MENTORIA,
    name: "Sesión de mentoría",
    unitAmount: 29900,
    currency: "mxn",
  },
  marketplace: {
    name: "Servicio marketplace",
    unitAmount: 9900,
    currency: "mxn",
  },
  curso: {
    name: "Compra de curso",
    unitAmount: 19900,
    currency: "mxn",
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe secret key is not configured." });
    }

    const { product } = (req.body || {}) as {
      product?: { kind?: string; quantity?: number; metadata?: Record<string, any> };
    };

    const kind = product?.kind || "diagnostico_profundo";
    const qty = Math.max(1, Number(product?.quantity || 1));
    const def = PRICE_TABLE[kind];
    if (!def) return res.status(400).json({ error: `Producto no permitido: ${kind}` });

    // Siempre mismo success/cancel del diagnóstico
    const baseEnv = process.env.NEXT_PUBLIC_APP_URL;
    const proto =
      (req.headers["x-forwarded-proto"] as string) ||
      (process.env.NODE_ENV === "production" ? "https" : "http");
    const host =
      (req.headers["x-forwarded-host"] as string) ||
      (req.headers.host as string) ||
      "localhost:3000";
    const baseUrl = baseEnv?.startsWith("http") ? baseEnv : `${proto}://${host}`;

    const successPath =
      process.env.NEXT_PUBLIC_CHECKOUT_SUCCESS_PATH || "/dashboard/diagnostico/checkout/success";
    const cancelPath =
      process.env.NEXT_PUBLIC_CHECKOUT_CANCEL_PATH || "/dashboard/diagnostico/checkout/cancel";

    const success_url = `${baseUrl}${successPath}?session_id={CHECKOUT_SESSION_ID}`;
    const cancel_url = `${baseUrl}${cancelPath}`;

    // Line items (usa priceId si tienes; si no, price_data dinámico)
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    if (def.priceId) {
      line_items.push({ price: def.priceId, quantity: qty });
    } else {
      if (!def.unitAmount || !def.currency) {
        return res.status(500).json({ error: "Config de producto inválida." });
      }
      line_items.push({
        quantity: qty,
        price_data: {
          currency: def.currency,
          unit_amount: def.unitAmount,
          product_data: { name: def.name, description: def.description },
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url,
      cancel_url,
      metadata: {
        kind,
        ...(product?.metadata || {}),
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("create-checkout-session error:", err);
    return res.status(500).json({ error: err?.message || "Stripe error" });
  }
}
