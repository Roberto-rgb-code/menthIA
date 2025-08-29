// components/marketplace/MyServicesPanel.tsx
import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

type Service = {
  providerId: string;
  serviceId: string;
  title: string;
  description?: string;
  priceFrom?: number;
  priceUnit?: string;
  images?: string[];
  createdAt?: number;
  updatedAt?: number;
};

export default function MyServicesPanel({
  providerId,
  uid,
  limit = 10,
  refreshKey = 0,
  onAddNew,
  onChanged,
}: {
  providerId: string;
  uid: string;
  limit?: number;
  refreshKey?: number;
  onAddNew: () => void;
  onChanged?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Service[]>([]);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  async function load() {
    setLoading(true);
    try {
      const r = await fetch(`/api/marketplace/services?providerId=${encodeURIComponent(providerId)}`);
      const j = await r.json();
      setItems(j.items || []);
    } catch (e) {
      toast.error("No se pudieron cargar tus servicios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); // eslint-disable-next-line
  }, [providerId, refreshKey]);

  const canAdd = items.length < limit;

  const del = async (s: Service) => {
    if (!uid) {
      toast.error("Debes iniciar sesión.");
      return;
    }
    const ok = confirm(`¿Eliminar el servicio “${s.title}”? Esta acción no se puede deshacer.`);
    if (!ok) return;

    // Borrado optimista + spinner por-item
    setBusyIds((m) => ({ ...m, [s.serviceId]: true }));
    const prev = items;
    setItems((list) => list.filter((x) => x.serviceId !== s.serviceId));

    try {
      const r = await fetch(
        `/api/marketplace/services/${encodeURIComponent(providerId)}/${encodeURIComponent(s.serviceId)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json", "x-user-id": uid },
        }
      );
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "No se pudo eliminar");

      // Releer desde la base para sincronizar con Providers (servicesCount/servicesSummary)
      await load();

      toast.success("Servicio eliminado.");
      onChanged?.();
    } catch (e: any) {
      setItems(prev); // revertir si falla
      toast.error(e.message || "Error eliminando");
    } finally {
      setBusyIds((m) => ({ ...m, [s.serviceId]: false }));
    }
  };

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">
          Mis servicios{" "}
          <span className="text-sm text-gray-500">({items.length}/{limit})</span>
        </h3>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
          onClick={onAddNew}
          disabled={!canAdd}
          title={canAdd ? "Agregar servicio" : "Límite alcanzado"}
        >
          <FiPlus /> Agregar servicio
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-white shadow-sm overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-8 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <div className="text-base font-medium">Aún no has publicado servicios</div>
          <div className="text-sm text-gray-600 mt-1">
            Crea tu primera oferta para que puedan contactarte.
          </div>
          <button
            className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-60"
            onClick={onAddNew}
            disabled={!canAdd}
          >
            Publicar servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((s) => {
            const img = s.images?.[0] || "";
            const deleting = !!busyIds[s.serviceId];

            return (
              <div key={s.serviceId} className="rounded-xl border bg-white shadow-sm overflow-hidden">
                <div className="h-36 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img ? (
                    <img src={img} alt={s.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-gray-500">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold line-clamp-1">{s.title}</div>
                  <div className="text-sm text-gray-600 line-clamp-2 mt-1">{s.description}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-sm font-medium">
                      {s.priceFrom ? `$${s.priceFrom.toLocaleString()} ${s.priceUnit || ""}` : "—"}
                    </div>
                    <button
                      className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                      onClick={() => del(s)}
                      title="Eliminar servicio"
                      disabled={deleting}
                      aria-busy={deleting}
                    >
                      <FiTrash2 />
                      {deleting ? "Eliminando…" : "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
