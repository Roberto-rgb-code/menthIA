// components/payments/Pricing.tsx
import React, { useState } from "react";
import { PAYMENT_RULES, applyIntro } from "../../lib/payments-config";

type BtnProps = {
  label: string;
  onClick: () => Promise<void>;
  loading?: boolean;
};
const Btn: React.FC<BtnProps> = ({ label, onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full rounded-lg bg-indigo-600 text-white px-4 py-2.5 hover:bg-indigo-700 disabled:opacity-60"
  >
    {loading ? "Procesando…" : label}
  </button>
);

export default function Pricing() {
  const [loading, setLoading] = useState<string | null>(null);

  async function go(kind: string, extra?: any) {
    try {
      setLoading(kind);
      const r = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...extra }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo iniciar el pago");
      window.location.href = j.url;
    } finally {
      setLoading(null);
    }
  }

  const m = PAYMENT_RULES.membresia_basica;
  const jr = PAYMENT_RULES.mentoria_jr;
  const sr = PAYMENT_RULES.mentoria_sr;
  const diag = PAYMENT_RULES.diagnostico_avanzado;

  function money(cents?: number) {
    if (cents == null) return "—";
    return `$ ${(cents / 100).toFixed(2)} MXN`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Planes y servicios</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Membresía */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">{m.title}</h3>
          <p className="text-sm text-gray-600 mt-1">Mensual</p>
          <div className="mt-4">
            <div className="text-3xl font-bold">
              {money(applyIntro(m.unitAmount, m.introDiscountPct))}
            </div>
            {m.introDiscountPct ? (
              <div className="text-xs text-gray-500">
                <s>{money(m.unitAmount)}</s> {" · "}
                {m.introDiscountPct}% introducción
              </div>
            ) : null}
          </div>
          <ul className="mt-4 space-y-1 text-sm text-gray-700 list-disc pl-5">
            {m.perks?.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          <div className="mt-6">
            <Btn
              label="Suscribirme"
              loading={loading === m.kind}
              onClick={() => go(m.kind)}
            />
          </div>
        </div>

        {/* Mentoría Jr */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">{jr.title}</h3>
          <p className="text-sm text-gray-600 mt-1">1 hora</p>
          <div className="mt-4">
            <div className="text-3xl font-bold">
              {money(applyIntro(jr.unitAmount, jr.introDiscountPct))}
            </div>
            {jr.introDiscountPct ? (
              <div className="text-xs text-gray-500">
                <s>{money(jr.unitAmount)}</s> {" · "}
                {jr.introDiscountPct}% introducción
              </div>
            ) : null}
          </div>
          <ul className="mt-4 space-y-1 text-sm text-gray-700 list-disc pl-5">
            {jr.perks?.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          <div className="mt-6 space-y-2">
            <Btn
              label="Reservar (primer consulta)"
              loading={loading === `${jr.kind}-first`}
              onClick={() => go(jr.kind, { firstConsult: true })}
            />
            <Btn
              label="Reservar"
              loading={loading === jr.kind}
              onClick={() => go(jr.kind)}
            />
          </div>
        </div>

        {/* Mentoría Sr */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">{sr.title}</h3>
          <p className="text-sm text-gray-600 mt-1">1 hora</p>
          <div className="mt-4">
            <div className="text-3xl font-bold">
              {money(applyIntro(sr.unitAmount, sr.introDiscountPct))}
            </div>
            {sr.introDiscountPct ? (
              <div className="text-xs text-gray-500">
                <s>{money(sr.unitAmount)}</s> {" · "}
                {sr.introDiscountPct}% introducción
              </div>
            ) : null}
          </div>
          <ul className="mt-4 space-y-1 text-sm text-gray-700 list-disc pl-5">
            {sr.perks?.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          <div className="mt-6 space-y-2">
            <Btn
              label="Reservar (primer consulta)"
              loading={loading === `${sr.kind}-first`}
              onClick={() => go(sr.kind, { firstConsult: true })}
            />
            <Btn
              label="Reservar"
              loading={loading === sr.kind}
              onClick={() => go(sr.kind)}
            />
          </div>
        </div>

        {/* Diagnóstico Avanzado */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">{PAYMENT_RULES.diagnostico_avanzado.title}</h3>
          <p className="text-sm text-gray-600 mt-1">Evento</p>
          <div className="mt-4">
            <div className="text-3xl font-bold">
              {money(applyIntro(diag.unitAmount, diag.introDiscountPct))}
            </div>
            {diag.introDiscountPct ? (
              <div className="text-xs text-gray-500">
                <s>{money(diag.unitAmount)}</s> {" · "}
                {diag.introDiscountPct}% introducción
              </div>
            ) : null}
          </div>
          <ul className="mt-4 space-y-1 text-sm text-gray-700 list-disc pl-5">
            {diag.perks?.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
          <div className="mt-6">
            <Btn
              label="Comprar"
              loading={loading === diag.kind}
              onClick={() => go(diag.kind)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
