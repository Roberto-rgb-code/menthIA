// pages/cursos/index.tsx
import React, { useEffect, useState } from "react";
import PrivateLayout from "@/components/layout/PrivateLayout";
import CourseCard from "@/components/courses/CourseCard";

type ApiCourse = {
  id: string;
  title?: string;
  shortDescription?: string;
  image?: string;
  instructorName?: string;
  priceCents?: number;  // si usas la API normalizada
  currency?: string;
  rating?: number;
  ratingsCount?: number;
  slug?: string;

  // compat con API vieja en español:
  titulo?: string;
  descripcionCorta?: string;
  imagenUrl?: string;
  instructorNombre?: string;
  precio?: number;      // en pesos
  moneda?: string;
  calificacionPromedio?: number;
  numeroCalificaciones?: number;
};

type CourseCardShape = {
  id: string;
  titulo: string;
  descripcionCorta: string;
  imagenUrl: string;
  instructorNombre: string;
  precio: number;   // PESOS (no centavos)
  moneda: string;   // "MXN", etc.
  calificacionPromedio?: number;
  numeroCalificaciones?: number;
};

export default function CursosPage() {
  const [cursos, setCursos] = useState<CourseCardShape[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const mapToCardShape = (api: ApiCourse): CourseCardShape => {
    // Soporta ambas APIs:
    const precioPesos =
      typeof api.precio === "number"
        ? api.precio
        : typeof api.priceCents === "number"
        ? api.priceCents / 100
        : 0;

    return {
      id: String(api.id),
      titulo: api.titulo || api.title || "",
      descripcionCorta: api.descripcionCorta || api.shortDescription || "",
      imagenUrl: api.imagenUrl || api.image || "",
      instructorNombre: api.instructorNombre || api.instructorName || "",
      precio: Math.max(0, precioPesos),
      moneda: (api.moneda || api.currency || "MXN").toUpperCase(),
      calificacionPromedio:
        typeof api.calificacionPromedio === "number"
          ? api.calificacionPromedio
          : typeof api.rating === "number"
          ? api.rating
          : undefined,
      numeroCalificaciones:
        typeof api.numeroCalificaciones === "number"
          ? api.numeroCalificaciones
          : typeof api.ratingsCount === "number"
          ? api.ratingsCount
          : undefined,
    };
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();

      // Acepta { items } o array plano
      const raw: ApiCourse[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.items)
        ? data.items
        : [];

      const mapped = raw.map(mapToCardShape);
      setCursos(mapped);
    } catch (e: any) {
      setError(e?.message || "No se pudieron cargar los cursos");
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = cursos.filter((c) => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (
      c.titulo.toLowerCase().includes(term) ||
      c.instructorNombre.toLowerCase().includes(term)
    );
  });

  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Cursos</h1>
          <div className="flex gap-2">
            <input
              className="border rounded-lg px-3 py-2 text-sm"
              placeholder="Buscar cursos"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
            />
            <button className="px-3 py-2 rounded-lg border" onClick={load}>
              Buscar
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-sm">
            {error}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl border animate-pulse bg-white" />
            ))
          ) : visible.length === 0 ? (
            <div className="text-gray-600 col-span-full">
              {q ? "Sin resultados para tu búsqueda." : "No hay cursos todavía."}
            </div>
          ) : (
            visible.map((curso) => <CourseCard key={curso.id} curso={curso} />)
          )}
        </div>
      </div>
    </PrivateLayout>
  );
}
