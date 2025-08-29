import React from "react";
import PrivateLayout from "../components/layout/PrivateLayout";
import { useAuth } from "../hooks/useAuth";
import AddToCartButton from "../components/commerce/AddToCartButton";
import { Product } from "../types/commerce";
import Link from "next/link";

const demo: Product[] = [
  { id: "curso-ventas", name: "Curso: Ventas Consultivas", priceCents: 19900, kind: "curso", image: "https://placehold.co/300x200?text=Curso" },
  { id: "mentoria-1h", name: "Mentoría 1:1 (1 hora)", priceCents: 9900, kind: "mentoria", image: "https://placehold.co/300x200?text=Mentoria" },
  { id: "servicio-brand", name: "Servicio: Brand Sprint", priceCents: 39900, kind: "servicio", image: "https://placehold.co/300x200?text=Servicio" },
  { id: "diagnostico-profundo", name: "Diagnóstico Profundo", priceCents: 49900, kind: "diagnostico", image: "https://placehold.co/300x200?text=Diagnostico" },
];

export default function DemoCatalog() {
  const { user } = useAuth();
  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gray-100 py-8 px-3 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold text-indigo-800">Catálogo demo</div>
            <Link href="/cart" className="px-4 py-2 rounded-lg border">Ver carrito</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {demo.map(p => (
              <div key={p.id} className="bg-white border rounded-xl shadow p-4">
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-lg border" />
                <div className="mt-3 font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600">MXN ${(p.priceCents/100).toFixed(2)}</div>
                <div className="mt-3">
                  <AddToCartButton product={p} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
