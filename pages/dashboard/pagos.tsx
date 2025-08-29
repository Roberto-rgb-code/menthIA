// pages/dashboard/pagos.tsx
import { useEffect, useMemo, useState } from "react";
import PrivateLayout from "../../components/layout/PrivateLayout";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiRefreshCw, FiExternalLink, FiCreditCard } from "react-icons/fi";

type CheckoutSession = {
  id: string;
  status?: string | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  customer_email?: string | null;
  created?: number;
  metadata?: Record<string, string>;
  url?: string | null;
};

type ChargeLike = {
  id: string;
  status?: string;
  amount?: number;
  currency?: string;
  receipt_url?: string | null;
  created?: number;
  description?: string | null;
  metadata?: Record<string, string>;
};

export default function PagosDashboard() {
  const [uid, setUid] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [sessions, setSessions] = useState<CheckoutSession[]>([]);
  const [charges, setCharges] = useState<ChargeLike[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || ""));
    setUid(auth.currentUser?.uid || "");
    return () => unsub();
  }, []);

  const load = async () => {
    if (!uid) return;
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/payments/list", {
        headers: { "x-user-id": uid },
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo cargar pagos");
      setSessions(Array.isArray(j.sessions) ? j.sessions : []);
      setCharges(Array.isArray(j.charges) ? j.charges : []);
    } catch (e: any) {
      setError(e.message || "Error al consultar Stripe");
      setSessions([]);
      setCharges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [uid]);

  const totalPaid = useMemo(() => {
    return (sessions || [])
      .filter(s => (s.payment_status === "paid"))
      .reduce((acc, s) => acc + (s.amount_total || 0), 0);
  }, [sessions]);

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50/30">
        <div className="bg-white/80 backdrop-blur border-b sticky top-0 z-[5]">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiCreditCard className="text-indigo-600" />
              <div className="font-semibold text-lg">Pagos</div>
              <span className="ml-2 text-xs text-gray-500">
                Tus cobros y compras en MentorApp
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={load}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 ${loading ? "opacity-70" : ""}`}
                title="Refrescar"
              >
                <FiRefreshCw className={loading ? "animate-spin" : ""} />
                Refrescar
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Pagos exitosos"
              value={sessions.filter(s => s.payment_status === "paid").length.toString()}
              hint="Sessions pagadas (Checkout)"
            />
            <StatCard
              title="Ingresos (pagados)"
              value={formatMoney(totalPaid, (sessions[0]?.currency || "mxn"))}
              hint="Suma de sessions pagadas"
            />
            <StatCard
              title="Cargos"
              value={charges.length.toString()}
              hint="Historial de cargos"
            />
          </div>

          {/* Alertas */}
          {error && (
            <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          {/* Sessions */}
          <section className="mt-8">
            <h2 className="text-lg font-semibold">Sessions de Checkout</h2>
            <p className="text-sm text-gray-500">Últimas operaciones creadas desde los módulos (mentoría, cursos, etc.).</p>

            <div className="mt-3 overflow-auto rounded-xl border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Monto</Th>
                    <Th>Estatus</Th>
                    <Th>Pago</Th>
                    <Th>Email</Th>
                    <Th>Origen</Th>
                    <Th>Acción</Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="p-4 text-gray-500" colSpan={7}>Cargando…</td></tr>
                  ) : sessions.length === 0 ? (
                    <tr><td className="p-4 text-gray-500" colSpan={7}>Sin registros</td></tr>
                  ) : (
                    sessions.map((s) => (
                      <tr key={s.id} className="border-t">
                        <Td>{formatDate(s.created)}</Td>
                        <Td className="font-medium">{formatMoney(s.amount_total || 0, s.currency || "mxn")}</Td>
                        <Td><Badge color={mapSessionColor(s.status)}>{s.status || "—"}</Badge></Td>
                        <Td><Badge color={s.payment_status === "paid" ? "emerald" : "gray"}>{s.payment_status || "—"}</Badge></Td>
                        <Td className="text-gray-700">{s.customer_email || "—"}</Td>
                        <Td className="text-gray-700">{humanizeOrigin(s.metadata)}</Td>
                        <Td>
                          {s.url ? (
                            <a className="inline-flex items-center gap-1 text-indigo-600 hover:underline" href={s.url} target="_blank" rel="noreferrer">
                              Abrir Checkout <FiExternalLink />
                            </a>
                          ) : <span className="text-gray-400">—</span>}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Charges */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold">Cargos</h2>
            <p className="text-sm text-gray-500">Cobros consolidados en Stripe (si aplica).</p>

            <div className="mt-3 overflow-auto rounded-xl border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-600">
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Monto</Th>
                    <Th>Estatus</Th>
                    <Th>Descripción</Th>
                    <Th>Recibo</Th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="p-4 text-gray-500" colSpan={5}>Cargando…</td></tr>
                  ) : charges.length === 0 ? (
                    <tr><td className="p-4 text-gray-500" colSpan={5}>Sin registros</td></tr>
                  ) : (
                    charges.map((c) => (
                      <tr key={c.id} className="border-t">
                        <Td>{formatDate(c.created)}</Td>
                        <Td className="font-medium">{formatMoney(c.amount || 0, c.currency || "mxn")}</Td>
                        <Td><Badge color={c.status === "succeeded" ? "emerald" : "gray"}>{c.status || "—"}</Badge></Td>
                        <Td className="text-gray-700">{c.description || "—"}</Td>
                        <Td>
                          {c.receipt_url ? (
                            <a className="inline-flex items-center gap-1 text-indigo-600 hover:underline" href={c.receipt_url} target="_blank" rel="noreferrer">
                              Ver recibo <FiExternalLink />
                            </a>
                          ) : <span className="text-gray-400">—</span>}
                        </Td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="py-10 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} MentorApp. Todos los derechos reservados.
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}

/* -------------------- UI helpers -------------------- */
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
function Badge({ children, color = "gray" }: { children: React.ReactNode; color?: "gray"|"emerald"|"amber"|"sky" }) {
  const m = {
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    sky: "bg-sky-50 text-sky-700 border-sky-200",
  }[color];
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${m}`}>{children}</span>;
}
function formatDate(epoch?: number) {
  if (!epoch) return "—";
  const d = new Date(epoch * 1000);
  return d.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}
function formatMoney(cents: number, currency: string) {
  const val = (cents || 0) / 100;
  try {
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: currency.toUpperCase() }).format(val);
  } catch {
    return `$${val.toFixed(2)} ${currency?.toUpperCase() || ""}`;
  }
}
function mapSessionColor(status?: string | null): "gray"|"emerald"|"amber"|"sky" {
  switch (status) {
    case "complete": return "emerald";
    case "open": return "sky";
    case "expired": return "amber";
    default: return "gray";
  }
}
function humanizeOrigin(meta?: Record<string,string>) {
  if (!meta) return "—";
  if (meta.kind) return meta.kind.replaceAll("_"," ");
  if (meta.module) return meta.module;
  return "—";
}

/* -------- StatCard helper -------- */
function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  );
}
