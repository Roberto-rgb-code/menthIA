// pages/api/payments/create-payment-intent.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

// 1) Inicializa Stripe con tu Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20",
});

// 2) Tabla de precios del lado servidor (anti-manipulación)
//    Ajusta montos/currency según tu caso. Los montos están en centavos.
const PRICE_TABLE: Record<
  string,
  { amountCents: number; currency: string; desc: string }
> = {
  diagnostico_profundo: {
    amountCents: Number(process.env.NEXT_PUBLIC_PRICE_DIAG_PROFUNDO_CENTS || 49900),
    currency: "mxn",
    desc: "Diagnóstico Profundo — Análisis consultivo 30-60-90 con IA",
  },
  // Productos genéricos que ya usas
  curso: {
    amountCents: 19900,
    currency: "mxn",
    desc: "Compra de curso",
  },
  marketplace: {
    amountCents: 9900,
    currency: "mxn",
    desc: "Servicio en marketplace",
  },
  // Mentoría genérica
  mentoria: {
    amountCents: 29900,
    currency: "mxn",
    desc: "Sesión de mentoría",
  },
  // Mentorías específicas (para evitar 'Producto inválido')
  mentoria_jr: {
    amountCents: 39900,
    currency: "mxn",
    desc: "Mentoría 30–60 min (Jr)",
  },
  mentoria_sr: {
    amountCents: 89900,
    currency: "mxn",
    desc: "Mentoría 60 min (Sr)",
  },
};

type ReqBody = {
  product?: {
    // diagnostico_profundo | curso | marketplace | mentoria | mentoria_jr | mentoria_sr
    kind?: string;
    metadata?: Record<string, string | number | null | undefined>;
  };
  userId?: string;
  customer_email?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Seguridad básica: Secret Key presente
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe secret key is not configured." });
  }

  try {
    const body: ReqBody = req.body || {};
    const kind = body?.product?.kind || "diagnostico_profundo";

    // 3) Resuelve precio por "kind" desde la tabla del server
    const price = PRICE_TABLE[kind];
    if (!price) {
      return res.status(400).json({ error: `Producto no permitido: ${kind}` });
    }

    const amount = price.amountCents;
    const currency = (price.currency || "mxn").toLowerCase();

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "Cantidad inválida para el producto." });
    }

    // 4) Metadata útil para identificar la compra (mentorId, startISO, etc.)
    const metadata: Record<string, string> = {
      kind,
      ...(body?.userId ? { userId: String(body.userId) } : {}),
    };

    if (body?.product?.metadata) {
      for (const [k, v] of Object.entries(body.product.metadata)) {
        if (v !== undefined && v !== null) metadata[k] = String(v);
      }
    }

    // 5) Opcional: idempotency key para evitar cobros duplicados si el cliente reintenta
    //    Puedes pasar un header "x-idempotency-key" desde el frontend.
    const idemKey = (req.headers["x-idempotency-key"] as string) || undefined;

    // 6) Crea el PaymentIntent con métodos automáticos
    const intent = await stripe.paymentIntents.create(
      {
        amount, // en centavos
        currency,
        description: price.desc,
        metadata,
        automatic_payment_methods: { enabled: true },
        receipt_email: body.customer_email || undefined,
      },
      idemKey ? { idempotencyKey: idemKey } : undefined
    );

    // 7) Devuelve el clientSecret al frontend
    return res.status(200).json({
      clientSecret: intent.client_secret,
      product: { kind, amountCents: amount, currency, desc: price.desc },
    });
  } catch (err: any) {
    console.error("create-payment-intent error:", err);
    return res.status(500).json({
      error: err?.message || "No se pudo crear el intento de pago.",
    });
  }
}
