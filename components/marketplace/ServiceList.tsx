import { useEffect, useState } from "react";

type Service = {
  providerId: string;
  serviceId: string;
  title: string;
  description?: string;
  images?: string[];
  priceFrom?: number;
  priceUnit?: string;
};

export default function ServiceList({ providerId }: { providerId: string }) {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `/api/marketplace/services?providerId=${encodeURIComponent(providerId)}`
      );
      const j = await r.json();
      setItems(j.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [providerId]);

  useEffect(() => {
    const onCreated = (ev: Event) => {
      const s: any = (ev as CustomEvent).detail;
      if (!s || s.providerId !== providerId) return;
      setItems((prev) =>
        prev.some((x) => x.serviceId === s.serviceId) ? prev : [s, ...prev]
      );
    };
    const onDeleted = (ev: Event) => {
      const d: any = (ev as CustomEvent).detail;
      if (!d || d.providerId !== providerId) return;
      setItems((prev) => prev.filter((x) => x.serviceId !== d.serviceId));
    };
    window.addEventListener("marketplace:service:created", onCreated as any);
    window.addEventListener("marketplace:service:deleted", onDeleted as any);
    return () => {
      window.removeEventListener("marketplace:service:created", onCreated as any);
      window.removeEventListener("marketplace:service:deleted", onDeleted as any);
    };
  }, [providerId]);

  if (loading) {
    return <div className="text-sm text-gray-500">Cargando servicios…</div>;
  }

  if (!items.length) {
    return (
      <div className="text-sm text-gray-500">
        Este proveedor aún no publicó servicios.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((s) => (
        <div key={s.serviceId} className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="h-36 bg-gray-50 grid place-items-center">
            {s.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.images[0]}
                alt={s.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <span className="text-xs text-gray-400">Sin imagen</span>
            )}
          </div>
          <div className="p-4">
            <div className="font-semibold line-clamp-1">{s.title}</div>
            <div className="text-sm text-gray-600 line-clamp-2 mt-1">{s.description}</div>
            <div className="mt-3 text-sm font-medium">
              {typeof s.priceFrom === "number" && s.priceFrom > 0
                ? `$${s.priceFrom.toLocaleString()} ${s.priceUnit || ""}`
                : "—"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
