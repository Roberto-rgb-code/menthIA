// components/courses/CourseCard.tsx
import React, { useState } from "react";
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { getAuth } from "firebase/auth";
import { useCart } from "@/contexts/CartContext";

interface Curso {
  id: string;
  titulo: string;
  descripcionCorta: string;
  imagenUrl: string;
  instructorNombre: string;
  precio: number;      // en PESOS (p. ej. 499.00)
  moneda: string;      // MXN, USD, ...
  calificacionPromedio?: number;
  numeroCalificaciones?: number;
}

interface CourseCardProps {
  curso: Curso;
}

const CourseCard: React.FC<CourseCardProps> = ({ curso }) => {
  const [paying, setPaying] = useState(false);
  const { addItem } = useCart();

  const amountCents = Math.max(0, Math.round((curso.precio || 0) * 100));
  const priceFormatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: (curso.moneda || "MXN").toUpperCase(),
  }).format(curso.precio || 0);

  // Agregar al carrito
  const addToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addItem({
      id: `course:${curso.id}`,
      kind: "curso",
      title: curso.titulo,
      priceCents: amountCents,
      image: curso.imagenUrl || null,
      meta: {
        courseId: curso.id,
        instructor: curso.instructorNombre || "",
        currency: (curso.moneda || "MXN").toUpperCase(),
      },
    });
  };

  // Comprar ahora → Checkout
  const buyNowViaCart = (e?: React.MouseEvent) => {
    addToCart(e);
    window.location.href = `/checkout?ret=${encodeURIComponent("/cursos")}`;
  };

  // (Opcional) Stripe directo (mantener apagado a menos que lo uses)
  const goToCheckoutCurso = async (
    cents: number,
    courseId: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      setPaying(true);
      const auth = getAuth();
      const uid = auth.currentUser?.uid || "";
      const r = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(uid ? { "x-user-id": uid } : {}),
        },
        body: JSON.stringify({
          kind: "curso",
          courseId,
          customAmount: cents, // centavos
          currency: (curso.moneda || "MXN").toUpperCase(),
          meta: { courseTitle: curso.titulo },
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo iniciar el pago");
      window.location.href = j.url;
    } catch (err: any) {
      alert(err.message || "Error iniciando pago");
    } finally {
      setPaying(false);
    }
  };

  return (
    <Link href={`/cursos/${curso.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer h-full flex flex-col">
        {/* Imagen */}
        <div className="relative w-full h-40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={curso.imagenUrl || "https://via.placeholder.com/400x250?text=Curso+Imagen"}
            alt={curso.titulo}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{curso.titulo}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{curso.descripcionCorta}</p>
          <p className="text-xs text-gray-500 mb-2">{curso.instructorNombre}</p>

          {/* Calificación (opcional) */}
          {curso.calificacionPromedio !== undefined &&
            curso.numeroCalificaciones !== undefined && (
              <div className="flex items-center text-sm text-yellow-500 mb-2">
                <span className="font-bold mr-1">
                  {Number(curso.calificacionPromedio).toFixed(1)}
                </span>
                <FaStar />
                <span className="text-gray-500 ml-2">
                  ({curso.numeroCalificaciones})
                </span>
              </div>
            )}

          {/* Precio + Acciones */}
          <div className="mt-auto pt-2 flex items-center justify-between gap-3">
            <p className="text-lg font-bold text-gray-900">{priceFormatted}</p>
            <div className="flex gap-2">
              <button
                onClick={addToCart}
                className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
                title="Agregar al carrito"
              >
                Agregar
              </button>

              <button
                onClick={buyNowViaCart}
                className="px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                title="Comprar ahora"
              >
                Comprar
              </button>

              {false && (
                <button
                  onClick={(e) => goToCheckoutCurso(amountCents, curso.id, e)}
                  className="px-3 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                  disabled={paying || !amountCents}
                  title={!amountCents ? "Precio inválido" : "Pagar con Stripe"}
                >
                  {paying ? "Redirigiendo…" : "Pagar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
