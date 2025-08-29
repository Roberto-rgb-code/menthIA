// components/marketplace/ServiceCard.tsx
import React, { useState } from "react";
import { useRouter } from "next/router";
import { getAuth } from "firebase/auth";
// Si tienes contexto de carrito:
import { useCart } from "@/contexts/CartContext";
// Si no, usaremos localStorage como fallback

import { Service } from "../../types/marketplace";

export default function ServiceCard({ s }: { s: Service }) {
  const [paying, setPaying] = useState(false);
  const router = useRouter();
  const cart = (() => {
    try { return useCart(); } catch { return null as any; }
  })();

  const img = s.images?.[0];
  const currency = (s as any)?.currency?.toUpperCase?.() || "MXN";
  const amountCents = Number.isFinite(Number(s.priceFrom))
    ? Math.round(Number(s.priceFrom) * 100)
    : 0;

  const priceFormatted = Number.isFinite(Number(s.priceFrom))
    ? new Intl.NumberFormat("es-MX", { style: "currency", currency }).format(Number(s.priceFrom))
    : "";

  const goToCheckout = async () => {
    setPaying(true);
    try {
      const item = {
        id: s.serviceId || (s as any).id,
        kind: "marketplace_service" as const,
        title: s.title,
        image: img || "",
        priceCents: amountCents,
        currency,
        quantity: 1,
        meta: { providerId: s.providerId },
      };

      if (cart?.add) {
        cart.add(item);
      } else {
        const key = "mentorapp_cart_items";
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        const exists = arr.find((x: any) => x.id === item.id && x.kind === item.kind);
        if (!exists) arr.push(item);
        localStorage.setItem(key, JSON.stringify(arr));
      }

      const ret = window.location.pathname;
      router.push(`/checkout?ret=${encodeURIComponent(ret)}`);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="h-40 bg-gray-100">
        {img && <img src={img} className="w-full h-full object-cover" alt={s.title} />}
      </div>
      <div className="p-4">
        <div className="font-semibold">{s.title}</div>
        <div className="text-sm text-gray-600 line-clamp-2 mt-1">{s.description}</div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">
            {priceFormatted ? (
              <>
                <span className="font-medium">{priceFormatted}</span>
                {s.priceUnit ? <span className="text-gray-500"> / {s.priceUnit}</span> : null}
              </>
            ) : <span className="text-gray-500">Precio a cotizar</span>}
          </div>

          <button
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            onClick={goToCheckout}
            disabled={!amountCents || paying}
            title={!amountCents ? "Precio no disponible" : "Ir al checkout"}
          >
            {paying ? "Redirigiendo…" : "Contratar"}
          </button>
        </div>
      </div>
    </div>
  );
}
