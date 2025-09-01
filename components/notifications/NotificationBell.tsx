// components/notifications/NotificationBell.tsx
import { useEffect, useRef, useState } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { useAuth } from "@/hooks/useAuth";

type Notif = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read?: boolean;
  createdAt: string; // ISO
  meta?: any;
};

type NotificationBellProps = {
  renderTrigger?: (args: { count: number; onToggle: () => void }) => React.ReactNode;
};

export default function NotificationBell({ renderTrigger }: NotificationBellProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = items.filter((n) => !n.read).length;

  async function load() {
    const uid = (user as any)?.uid || (user as any)?.id; // soporta distintos providers
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/notifications/list?limit=30`, {
        headers: { "x-user-id": String(uid) },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "No se pudo cargar");
      setItems(Array.isArray(j.items) ? j.items : []);
    } catch (e: any) {
      setError(e.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  // Carga al abrir el dropdown
  useEffect(() => {
    if (open) load();
  }, [open]);

  // Cerrar al click fuera
  useEffect(() => {
    function handleClickOutside(ev: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(ev.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const onToggle = () => setOpen((s) => !s);

  return (
    <div className="relative" ref={panelRef}>
      {renderTrigger ? (
        <>{renderTrigger({ count: unread, onToggle })}</>
      ) : (
        <button
          onClick={onToggle}
          className="relative text-white hover:text-yellow-300 p-2 rounded-lg"
          aria-label="Notificaciones"
        >
          <IoNotificationsOutline className="h-6 w-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center text-[10px] font-bold rounded-full bg-red-600 text-white px-1.5 py-0.5">
              {unread}
            </span>
          )}
        </button>
      )}

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50">
          <div className="px-4 py-3 border-b">
            <div className="font-semibold text-gray-800">Notificaciones</div>
            <div className="text-xs text-gray-500">
              {loading ? "Cargando…" : unread > 0 ? `${unread} sin leer` : "Al día ✅"}
            </div>
          </div>

          {error ? (
            <div className="p-4 text-sm text-rose-600">{error}</div>
          ) : items.length === 0 && !loading ? (
            <div className="p-4 text-sm text-gray-500">No tienes notificaciones.</div>
          ) : (
            <div className="max-h-96 overflow-auto divide-y">
              {items.map((n) => (
                <div key={n.id} className="p-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-gray-800">{n.title || "Notificación"}</div>
                    {!n.read && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">nuevo</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mt-0.5">{n.body}</div>
                  <div className="text-[11px] text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                  {n.meta?.meetLink || n.meta?.calendarHtmlLink ? (
                    <div className="mt-2 flex gap-2">
                      {n.meta?.meetLink && (
                        <a
                          href={n.meta.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          Abrir Meet
                        </a>
                      )}
                      {n.meta?.calendarHtmlLink && (
                        <a
                          href={n.meta.calendarHtmlLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-2 py-1 rounded border text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                        >
                          Ver en Calendar
                        </a>
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          <div className="px-3 py-2 border-t bg-gray-50 rounded-b-lg flex items-center justify-between">
            <button className="text-xs text-gray-600 hover:text-gray-800" onClick={load} disabled={loading}>
              {loading ? "Actualizando…" : "Actualizar"}
            </button>
            <a href="/dashboard/notificaciones" className="text-xs text-blue-700 hover:underline">
              Ver todas →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
