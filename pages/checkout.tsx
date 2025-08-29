import React, { useEffect, useMemo, useState } from "react";
import PrivateLayout from "@/components/layout/PrivateLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { FaSpinner } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";

const money = (cents: number, currency = "MXN") =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency }).format((cents || 0) / 100);

const PUBLISHABLE = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const CREATE_INTENT_URL = "/api/payments/create-payment-intent";
const USE_STRIPE = !!PUBLISHABLE;
const stripePromise = PUBLISHABLE ? loadStripe(PUBLISHABLE) : null;

// -------- Utils para Single Item desde query ----------
type QSingle = {
  kind: string;
  id: string;
  title: string;
  priceCents: number;
  quantity: number;
  currency: string;
  image?: string;
};

function getSingleItemFromQuery(q: Record<string, any>): QSingle | null {
  const kind = typeof q.kind === "string" ? q.kind : "";
  const id = typeof q.id === "string" ? q.id : "";
  const title = typeof q.title === "string" ? q.title : "";
  const priceCents = Number(q.priceCents);
  const quantity = Number(q.quantity || 1) || 1;
  const currency = (typeof q.currency === "string" ? q.currency : "MXN").toUpperCase();
  const image = typeof q.image === "string" ? q.image : undefined;

  if (!kind || !id || !title || !Number.isFinite(priceCents) || priceCents <= 0) return null;

  return { kind, id, title, priceCents, quantity, currency, image };
}

// --------------- Stripe Checkout Inner ----------------
const CheckoutInner: React.FC<{ clientSecret: string; onPaid: () => void }> = ({ clientSecret, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== "undefined" ? window.location.origin + "/checkout" : undefined,
      },
      redirect: "if_required",
    });
    if (error) {
      alert(error.message || "Error al confirmar el pago");
      setSubmitting(false);
      return;
    }
    onPaid();
    const ret = typeof router.query.ret === "string" ? router.query.ret : "/";
    router.replace(ret);
  };

  return (
    <div className="bg-white border rounded-2xl p-4 shadow">
      <div className="text-lg font-semibold mb-3">Pago</div>
      <PaymentElement />
      <button
        onClick={handlePay}
        disabled={!stripe || submitting}
        className="mt-4 w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold disabled:opacity-60"
      >
        {submitting ? "Procesando..." : "Pagar"}
      </button>
    </div>
  );
};

// ----------------- Página principal -------------------
const CheckoutPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotalCents, clear } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const router = useRouter();

  // SINGLE ITEM (cuando vienes con query desde “Pagar”)
  const single = useMemo(() => getSingleItemFromQuery(router.query as any), [router.query]);

  // ¿Tenemos carrito o item único?
  const effectiveItems = useMemo(() => {
    if (items.length > 0) {
      // del carrito
      return items.map((it) => ({
        id: it.id,
        kind: it.kind,
        qty: it.quantity,
        priceCents: it.priceCents,
        title: it.title,
        image: it.image,
        currency: "MXN", // si tu cart soporta multi-moneda, cámbialo aquí
      }));
    }
    if (single) {
      return [
        {
          id: single.id,
          kind: single.kind,
          qty: single.quantity,
          priceCents: single.priceCents,
          title: single.title,
          image: single.image,
          currency: single.currency,
        },
      ];
    }
    return [];
  }, [items, single]);

  const effectiveCurrency = useMemo(() => {
    if (items.length > 0) return "MXN";
    return single?.currency || "MXN";
  }, [items.length, single?.currency]);

  const effectiveSubtotal = useMemo(() => {
    if (items.length > 0) return subtotalCents;
    if (single) return single.priceCents * single.quantity;
    return 0;
  }, [items.length, subtotalCents, single]);

  const hasDiagnostico = useMemo(
    () => effectiveItems.some((i) => i.kind === "diagnostico"),
    [effectiveItems]
  );

  useEffect(() => {
    if (!USE_STRIPE) return;
    if (effectiveItems.length === 0 || effectiveSubtotal <= 0) return;

    const run = async () => {
      try {
        const payload = {
          amountCents: effectiveSubtotal,
          currency: (effectiveCurrency || "MXN").toLowerCase(),
          items: effectiveItems,
          userId: user?.uid || undefined,
        };

        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (user?.uid) headers["x-user-id"] = user.uid;

        const res = await fetch(CREATE_INTENT_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.clientSecret) {
          throw new Error(data?.error || "No se pudo crear el intento de pago");
        }
        setClientSecret(data.clientSecret);
      } catch (e: any) {
        alert(e.message || "Error al crear el intento de pago.");
      }
    };
    run();
  }, [effectiveItems, effectiveSubtotal, effectiveCurrency, user?.uid]);

  const onPaid = () => {
    if (hasDiagnostico) {
      try {
        localStorage.setItem("diag_profundo_paid", "1");
      } catch {}
    }
    // Si venía del carrito, lo limpiamos.
    if (items.length > 0) clear();
    alert("¡Pago completado!");
  };

  if (authLoading) {
    return (
      <PrivateLayout>
        <div className="min-h-[60vh] grid place-items-center">
          <FaSpinner className="animate-spin text-indigo-600" size={36} />
        </div>
      </PrivateLayout>
    );
  }

  if (!user) {
    return (
      <PrivateLayout>
        <div className="min-h-[60vh] grid place-items-center">
          <div className="text-center">
            <p className="text-lg mb-3">Debes iniciar sesión para continuar.</p>
            <a className="px-4 py-2 bg-indigo-600 text-white rounded-lg" href="/login">
              Iniciar sesión
            </a>
          </div>
        </div>
      </PrivateLayout>
    );
  }

  const retTo = typeof router.query.ret === "string" ? router.query.ret : "/";

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 py-8 px-3 md:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Checkout */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <div className="text-xl font-bold text-indigo-800">Checkout</div>
              <div className="text-xs text-gray-500">Completa tu pago y recibe acceso</div>
            </div>

            {effectiveItems.length === 0 ? (
              <div className="p-6 bg-white border rounded-2xl text-gray-600 shadow">
                No hay productos para pagar.
              </div>
            ) : USE_STRIPE ? (
              clientSecret && stripePromise ? (
                <Elements options={{ clientSecret }} stripe={stripePromise}>
                  <CheckoutInner clientSecret={clientSecret} onPaid={onPaid} />
                </Elements>
              ) : (
                <div className="p-6 bg-white border rounded-2xl shadow">
                  Preparando formulario de pago…
                </div>
              )
            ) : (
              // MODO DEMO / SIN STRIPE
              <div className="bg-white border rounded-2xl p-4 shadow">
                <div className="text-sm text-gray-600 mb-3">
                  <b>Pago desactivado</b> (falta configurar Stripe). Usa el botón de demo para simular el pago.
                </div>
                <button
                  className="w-full px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold"
                  onClick={() => {
                    onPaid();
                    // vuelta a donde estabas
                    window.location.href = retTo;
                  }}
                >
                  Simular pago y completar pedido
                </button>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-2xl p-4 shadow">
              <div className="font-semibold mb-3">Resumen</div>
              <div className="space-y-3">
                {effectiveItems.map((it) => (
                  <div key={`${it.kind}-${it.id}`} className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image || "https://placehold.co/56x56"}
                      alt={it.title}
                      className="w-14 h-14 rounded-lg border object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{it.title}</div>
                      <div className="text-[11px] text-gray-500 capitalize">{it.kind}</div>
                      <div className="text-xs text-gray-600">x{it.qty}</div>
                    </div>
                    <div className="text-sm font-semibold">
                      {money(it.priceCents * it.qty, effectiveCurrency)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t pt-3 flex items-center justify-between">
                <div className="text-sm text-gray-600">Subtotal</div>
                <div className="text-lg font-extrabold">
                  {money(effectiveSubtotal, effectiveCurrency)}
                </div>
              </div>

              <div className="mt-2 text-xs text-gray-400">
                * Impuestos/fees pueden variar según el método de pago.
              </div>
            </div>

            {effectiveItems.some((i) => i.kind === "diagnostico") && (
              <div className="mt-3 p-3 bg-indigo-50 text-indigo-900 rounded-xl border">
                Al pagar el <b>Diagnóstico Profundo</b>, tu acceso queda habilitado automáticamente.
              </div>
            )}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
};

export default CheckoutPage;
