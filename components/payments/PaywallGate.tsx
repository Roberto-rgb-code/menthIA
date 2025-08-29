import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";

type Props = {
  /** Identificador que tu backend usa en /api/payments/create-checkout-session */
  kind: string;
  /** Precio en centavos (499 MXN => 49900) */
  priceCents: number;
  /** Moneda (ej. "MXN", "USD") */
  currency?: string;
  /** Título a mostrar en el paywall */
  title?: string;
  /** Beneficios para listar en el paywall */
  benefits?: string[];
  /** Metadatos opcionales que quieras mandar a Stripe */
  meta?: Record<string, any>;
  /** Contenido que se mostrará SOLO si está pagado */
  children: React.ReactNode;
};

export default function PaywallGate({
  kind,
  priceCents,
  currency = "MXN",
  title = "Acceso",
  benefits = [],
  meta = {},
  children,
}: Props) {
  const router = useRouter();
  const sessionId = (router.query.session_id as string) || "";
  const [checking, setChecking] = useState(true);
  const [paid, setPaid] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const uid =
    typeof window !== "undefined" ? getAuth().currentUser?.uid || "" : "";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (sessionId) {
          const r = await fetch(
            `/api/payments/session-status?session_id=${encodeURIComponent(
              sessionId
            )}`
          );
          const j = await r.json();
          if (mounted) {
            setPaid(!!j.paid);
            setChecking(false);
          }
          return;
        }
        if (mounted) {
          setPaid(false);
          setChecking(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted) {
          setPaid(false);
          setChecking(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const priceFormatted = useMemo(
    () =>
      new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency,
      }).format(priceCents / 100),
    [priceCents, currency]
  );

  const goToCheckout = async () => {
    try {
      setRedirecting(true);
      const r = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(uid ? { "x-user-id": uid } : {}),
        },
        body: JSON.stringify({
          kind,
          customAmount: priceCents,
          currency,
          meta,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo iniciar el pago");
      window.location.href = j.url;
    } catch (e: any) {
      alert(e.message || "Error iniciando pago");
      setRedirecting(false);
    }
  };

  if (checking) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <p className="text-gray-500">Verificando estado de pago…</p>
      </div>
    );
  }

  if (!paid) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="rounded-2xl border shadow-sm bg-white p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              {benefits.length > 0 ? (
                <ul className="mt-1 text-sm text-gray-600 list-disc ml-5 space-y-1">
                  {benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">
                  Completa el pago para acceder.
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold">{priceFormatted}</div>
              <div className="text-xs text-gray-500">Pago único</div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={goToCheckout}
              disabled={redirecting}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {redirecting ? "Redirigiendo…" : "Pagar y acceder"}
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Tras pagar, volverás a esta página con tu acceso activado.
          </p>
        </div>
      </div>
    );
  }

  // Pagado => muestra el contenido
  return <>{children}</>;
}
