// components/payments/ProductCheckout.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

// Carga Stripe una sola vez
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "");

/**
 * Definición del producto que quiere pagarse.
 * En el backend protegemos el monto; aquí nos basta con el "kind".
 */
export type ProductInput = {
  kind: "diagnostico_profundo" | "curso" | "marketplace" | "mentoria";
  // Cualquier cosa extra que quieras mandar a metadata en el backend:
  metadata?: Record<string, string | number | null | undefined>;
};

type Props = {
  title?: string;
  subtitle?: string;
  product: ProductInput;
  /**
   * Endpoint que devuelve { clientSecret }
   * Por defecto: /api/payments/create-payment-intent
   */
  intentEndpoint?: string;
  /**
   * URL de éxito / cancelación (para redirección manual si la usas)
   * En nuestro flujo usamos onSuccess para setear ?paid=1 y volver.
   */
  successReturnUrl?: string;
  cancelReturnUrl?: string;
  /**
   * Qué hacer cuando el pago se confirma
   */
  onSuccess?: () => void;
};

const CheckoutInner: React.FC<{
  clientSecret: string;
  onSuccess?: () => void;
}> = ({ clientSecret, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    setMessage(null);

    if (!stripe || !elements) {
      setMessage("Stripe no está listo aún. Intenta de nuevo.");
      return;
    }

    // Asegura que el PaymentElement está montado
    const paymentElement = elements.getElement(PaymentElement);
    if (!paymentElement) {
      setMessage("Elemento de pago aún no está disponible. Espera un momento.");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await stripe.confirmPayment({
        elements,
        // Modo "redirect if required": si el método necesita 3DS, Stripe hará el redirect
        confirmParams: {
          // Puedes personalizar esta URL si quieres que Stripe redirija fuera de la SPA
          // return_url: successReturnUrl, // opcional si manejas éxito con onSuccess
        },
        redirect: "if_required",
      });

      if (error) {
        // Errores de validación o 3DS cancelado
        setMessage(error.message || "No se pudo completar el pago.");
        setIsSubmitting(false);
        return;
      }

      // Si no hubo redirect requerido y no hay error, el pago quedó confirmado.
      onSuccess?.();
    } catch (e: any) {
      setMessage(e?.message || "Ocurrió un error al procesar el pago.");
      setIsSubmitting(false);
    }
  }, [stripe, elements, onSuccess]);

  return (
    <div className="mt-4">
      {/* Renderiza el PaymentElement cuando hay clientSecret y Elements ya está listo */}
      <div className="bg-white border rounded-xl p-4">
        <PaymentElement />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!stripe || !elements || isSubmitting}
        className="mt-4 w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl disabled:opacity-60"
      >
        {isSubmitting ? "Procesando..." : "Pagar ahora"}
      </button>

      {message && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
          {message}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Pagos procesados de forma segura por Stripe.
      </p>
    </div>
  );
};

const ProductCheckout: React.FC<Props> = ({
  title = "Checkout",
  subtitle,
  product,
  intentEndpoint = "/api/payments/create-payment-intent",
  successReturnUrl,
  cancelReturnUrl,
  onSuccess,
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Crea el intent en el backend cuando montamos (una sola vez por producto)
  useEffect(() => {
    let cancelled = false;

    async function createIntent() {
      try {
        setLoading(true);
        setErr(null);
        setClientSecret(null);

        const res = await fetch(intentEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product,
          }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "No se pudo crear el intento de pago.");
        if (!json?.clientSecret) throw new Error("El backend no devolvió clientSecret.");

        if (!cancelled) {
          setClientSecret(json.clientSecret as string);
        }
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "No se pudo crear el intento de pago. Revisa el backend.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    createIntent();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentEndpoint, product?.kind]); // si cambias de producto, pide nuevo intent

  // Memoiza las options para que no cambien de referencia y no fuercen remount
  const elementsOptions = useMemo(() => {
    if (!clientSecret) return undefined;
    return {
      clientSecret,
      appearance: {
        theme: "stripe",
      },
    } as const;
  }, [clientSecret]);

  const handleSuccess = useCallback(() => {
    // Si definiste un onSuccess externo, úsalo; si no, navega con ?paid=1
    if (onSuccess) {
      onSuccess();
    } else if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("paid", "1");
      window.location.href = url.toString();
    }
  }, [onSuccess]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
      </div>

      {loading && (
        <div className="rounded-xl border p-4 bg-white">
          Preparando formulario de pago…
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 p-3">
          {err}
        </div>
      )}

      {/* Renderiza Elements SOLO cuando ya hay clientSecret */}
      {clientSecret && elementsOptions && (
        <Elements
          stripe={stripePromise}
          options={elementsOptions}
          // Esta key ayuda a que, si alguna vez cambia el clientSecret, se remonte ordenadamente
          key={clientSecret}
        >
          <CheckoutInner clientSecret={clientSecret} onSuccess={handleSuccess} />
        </Elements>
      )}

      {/* Enlace de cancelar opcional */}
      {cancelReturnUrl && (
        <div className="mt-3">
          <a
            className="text-sm text-gray-600 hover:underline"
            href={cancelReturnUrl}
          >
            Cancelar
          </a>
        </div>
      )}
    </div>
  );
};

export default ProductCheckout;
