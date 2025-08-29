// pages/dashboard/notificaciones.tsx
import Head from "next/head";
import { useEffect, useMemo, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { IoReload } from "react-icons/io5";
import { BsEnvelopeOpen, BsEnvelope } from "react-icons/bs";
import { TbCheck } from "react-icons/tb";

type Notif = {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  meta?: any;
  createdAt: string;
  read?: boolean;
};

type TabKey = "all" | "unread";

export default function NotificacionesPage() {
  const { user, loading } = useAuth();

  const [items, setItems] = useState<Notif[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const unreadCount = useMemo(() => items.filter(n => !n.read).length, [items]);
  const filtered = useMemo(
    () => (activeTab === "unread" ? items.filter(n => !n.read) : items),
    [items, activeTab]
  );

  const fetchNotifs = useCallback(async () => {
    if (!user?.uid) return;
    try {
      setStatus("loading");
      setErrorMsg("");
      const r = await fetch(`/api/notifications/list?limit=50`, {
        headers: { "x-user-id": user.uid },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "No se pudieron cargar las notificaciones.");
      setItems(Array.isArray(j.items) ? j.items : []);
      setStatus("ok");
    } catch (e: any) {
      setErrorMsg(e?.message || "Error inesperado");
      setStatus("error");
    }
  }, [user?.uid]);

  useEffect(() => {
    if (!loading && user?.uid) fetchNotifs();
  }, [loading, user?.uid, fetchNotifs]);

  async function markRead(id: string) {
    if (!user?.uid) return;
    try {
      const r = await fetch(`/api/notifications/mark-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({ id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "No se pudo marcar como leída.");
      setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error(e);
      alert((e as any)?.message || "Error marcando notificación como leída");
    }
  }

  async function markAllRead() {
    if (!user?.uid || unreadCount === 0) return;
    try {
      setMarkingAll(true);
      // Si tienes endpoint dedicated: /api/notifications/mark-all-read
      const r = await fetch(`/api/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.uid,
        },
        body: JSON.stringify({}),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "No se pudo marcar todas como leídas.");
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
      alert((e as any)?.message || "Error al marcar todas como leídas");
    } finally {
      setMarkingAll(false);
    }
  }

  async function refresh() {
    if (!user?.uid) return;
    try {
      setRefreshing(true);
      await fetchNotifs();
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <>
      <Head>
        <title>Notificaciones — MenthIA</title>
      </Head>

      <Navbar />

      <main className="min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
              <p className="text-slate-500 text-sm">
                Aquí verás tus avisos importantes de mentorías, pagos, y mensajes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={refreshing || status === "loading"}
                className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                title="Recargar"
              >
                <IoReload className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "Actualizando..." : "Recargar"}
              </button>
              <button
                onClick={markAllRead}
                disabled={markingAll || unreadCount === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
                title="Marcar todas como leídas"
              >
                <TbCheck size={18} />
                Marcar todas
                {unreadCount > 0 && (
                  <span className="ml-1 text-indigo-100 bg-indigo-500 rounded-full px-2 py-0.5 text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <div className="inline-flex rounded-lg bg-white p-1 shadow-sm border border-slate-200">
              <button
                onClick={() => setActiveTab("all")}
                className={[
                  "px-4 py-2 text-sm font-medium rounded-md",
                  activeTab === "all"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                Todas
              </button>
              <button
                onClick={() => setActiveTab("unread")}
                className={[
                  "px-4 py-2 text-sm font-medium rounded-md",
                  activeTab === "unread"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-50"
                ].join(" ")}
              >
                No leídas
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs px-2 py-0.5">
                  {unreadCount}
                </span>
              </button>
            </div>
          </div>

          {/* Estados */}
          {loading && (
            <div className="text-slate-500">Cargando sesión…</div>
          )}

          {!loading && !user && (
            <div className="p-6 rounded-xl bg-white border border-slate-200 text-slate-600">
              Inicia sesión para ver tus notificaciones.
            </div>
          )}

          {!loading && user && (
            <>
              {status === "loading" && (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-white border border-slate-200 h-20 rounded-xl" />
                  ))}
                </div>
              )}

              {status === "error" && (
                <div className="p-4 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
                  {errorMsg || "Error al cargar notificaciones"}
                  <button
                    className="ml-3 text-sm underline"
                    onClick={fetchNotifs}
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {status === "ok" && filtered.length === 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <div className="mx-auto mb-3 h-12 w-12 grid place-items-center rounded-full bg-slate-100">
                    <BsEnvelopeOpen className="text-slate-500" size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Sin notificaciones</h3>
                  <p className="text-slate-500 text-sm">
                    Cuando tengas novedades de tus mentores o pagos, aparecerán aquí.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={refresh}
                      className="text-sm rounded-lg border bg-white px-3 py-2 hover:bg-slate-50"
                    >
                      Buscar nuevas
                    </button>
                  </div>
                </div>
              )}

              {status === "ok" && filtered.length > 0 && (
                <ul className="space-y-3">
                  {filtered.map((n) => (
                    <li
                      key={n.id}
                      className={[
                        "rounded-2xl border bg-white px-4 py-3 sm:px-5 sm:py-4",
                        n.read ? "border-slate-200" : "border-indigo-200"
                      ].join(" ")}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {n.read ? (
                            <BsEnvelopeOpen className="text-slate-400" size={18} />
                          ) : (
                            <BsEnvelope className="text-indigo-500" size={18} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-semibold text-slate-900 truncate">
                              {n.title}
                            </div>
                            <div className="text-xs text-slate-400 shrink-0">
                              {new Date(n.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-slate-700 mt-0.5">
                            {n.body}
                          </div>

                          {/* Links útiles (Meet, Calendar, etc) */}
                          {(n.meta?.meetLink || n.meta?.calendarHtmlLink) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {n.meta?.meetLink && (
                                <a
                                  href={n.meta.meetLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                                >
                                  Abrir Meet
                                </a>
                              )}
                              {n.meta?.calendarHtmlLink && (
                                <a
                                  href={n.meta.calendarHtmlLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center text-xs font-medium text-indigo-600 hover:underline"
                                >
                                  Ver en Calendar
                                </a>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Acciones */}
                        {!n.read && (
                          <button
                            onClick={() => markRead(n.id)}
                            className="ml-2 shrink-0 text-xs px-3 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                            title="Marcar como leída"
                          >
                            Marcar
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
