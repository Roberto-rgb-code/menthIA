import React, { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";

type Slot = { startISO: string; endISO: string; booked?: boolean };

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AvailabilityModal({ open, onClose }: Props) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid || "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const today = new Date();
  const [date, setDate] = useState(toYMD(today));
  const [loading, setLoading] = useState(false);

  // Parámetros del generador
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [interval, setInterval] = useState(30); // mins

  // Lista editable de slots del día
  const [slots, setSlots] = useState<Slot[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  // Cargar al abrir
  useEffect(() => {
    if (!open || !uid) return;
    loadDay(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, uid]);

  // Cerrar con ESC y Ctrl/Cmd+S para guardar
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, date, slots]); // eslint-disable-line

  async function loadDay(d: string) {
    setLoading(true);
    setMsg(null);
    try {
      // LEE TODOS LOS SLOTS (incluye booked)
      const r = await fetch(`/api/availability/get?mentorId=${uid}&date=${encodeURIComponent(d)}`);
      const j = await r.json();
      const items = j.item?.slots ?? [];
      setSlots(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error(e);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }

  function generateSlots() {
    try {
      const gen = buildSlots(date, startTime, endTime, interval);
      // fusiona: añade los nuevos que no existan
      const map = new Map(slots.map((s) => [s.startISO + "|" + s.endISO, s]));
      for (const s of gen) {
        const key = s.startISO + "|" + s.endISO;
        if (!map.has(key)) map.set(key, s);
      }
      setSlots(Array.from(map.values()).sort((a, b) => a.startISO.localeCompare(b.startISO)));
    } catch (e: any) {
      alert(e.message || "Rango de horarios inválido");
    }
  }

  function removeSlot(s: Slot) {
    setSlots((prev) => prev.filter((x) => !(x.startISO === s.startISO && x.endISO === s.endISO)));
  }

  async function save() {
    if (!uid) return alert("Debes iniciar sesión.");
    if (!date) return alert("Selecciona una fecha.");
    setSaving(true);
    setMsg(null);
    try {
      // GUARDA EN /api/availability/set (incluye tz)
      const r = await fetch("/api/availability/set", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify({
          date,
          tz, // guarda zona horaria
          slots: slots.map((s) => ({
            startISO: s.startISO,
            endISO: s.endISO,
            booked: !!s.booked,
          })),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo guardar la disponibilidad");

      setMsg("Disponibilidad guardada ✅");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);

      // recarga por si el backend normaliza
      loadDay(date);

      // (opcional) broadcast por si alguna vista escucha
      window.dispatchEvent(new CustomEvent("availability:saved", { detail: { date, count: slots.length } }));
    } catch (e: any) {
      alert(e.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  const readableDate = formatYMDHuman(date);

  // Plantillas rápidas UX
  const quicks = [
    { label: "Mañana (9–12)", s: "09:00", e: "12:00", i: 30 },
    { label: "Tarde (14–18)", s: "14:00", e: "18:00", i: 30 },
    { label: "Jornada (9–18)", s: "09:00", e: "18:00", i: 60 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" aria-modal role="dialog">
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden relative"
      >
        {/* Toast éxito */}
        {showToast && (
          <div className="absolute right-4 top-4 z-20">
            <div className="rounded-lg bg-emerald-600 text-white text-sm px-3 py-2 shadow-lg">
              Disponibilidad guardada ✅
            </div>
          </div>
        )}

        {/* Header sticky */}
        <div className="px-6 py-4 border-b bg-white/90 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Mi disponibilidad</h3>
            <p className="text-xs text-gray-500">Zona horaria detectada: <b>{tz}</b></p>
          </div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Columna izquierda: selector y generador */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                min={toYMD(today)}
                onChange={(e) => { setDate(e.target.value); loadDay(e.target.value); }}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <div className="text-xs text-gray-500 mt-1">{readableDate}</div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="font-medium text-sm">Generar horarios</div>

              {/* Plantillas rápidas */}
              <div className="flex flex-wrap gap-2 mt-2">
                {quicks.map(q => (
                  <button
                    key={q.label}
                    onClick={() => { setStartTime(q.s); setEndTime(q.e); setInterval(q.i); }}
                    className="px-3 py-1.5 rounded-full text-xs border hover:border-indigo-400"
                    type="button"
                    title="Aplicar plantilla"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Inicio</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Intervalo (min)</label>
                  <select
                    value={interval}
                    onChange={(e) => setInterval(Number(e.target.value))}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {[15, 30, 45, 60].map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={generateSlots}
                    className="w-full px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
                    type="button"
                  >
                    Generar y añadir
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Puedes generar varias veces; no se duplican horarios. Antes de guardar, quita lo que no quieras.
              </p>
            </div>
          </div>

          {/* Columna derecha: slots del día */}
          <div>
            <div className="flex items-center justify-between">
              <div className="font-medium">
                Horarios del día
                <span className="ml-2 text-xs text-gray-500">
                  ({slots.length} {slots.length === 1 ? "slot" : "slots"})
                </span>
              </div>
              <button
                onClick={() => {
                  if (slots.length === 0) return;
                  if (confirm("¿Limpiar todos los horarios de este día?")) setSlots([]);
                }}
                className="text-xs text-gray-600 hover:text-gray-800 underline"
                type="button"
              >
                Limpiar todo
              </button>
            </div>

            <div className={`mt-3 min-h-[160px] rounded-lg border ${loading ? "opacity-60" : ""}`}>
              {loading ? (
                <div className="p-4 text-sm text-gray-500">Cargando…</div>
              ) : slots.length === 0 ? (
                <div className="p-4 text-sm text-gray-600">Sin horarios. Genera y luego guarda.</div>
              ) : (
                <div className="p-3 flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const label = formatRangeLocal(s.startISO, s.endISO);
                    return (
                      <span
                        key={s.startISO + "|" + s.endISO}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border
                          ${s.booked ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-white"}
                        `}
                        title={s.booked ? "Reservado" : "Disponible"}
                      >
                        {label}
                        {!s.booked && (
                          <button
                            className="text-gray-500 hover:text-rose-600"
                            onClick={() => removeSlot(s)}
                            title="Quitar"
                            type="button"
                          >
                            ✕
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={onClose} type="button">Cerrar</button>
              <button
                onClick={save}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                disabled={saving}
                type="button"
              >
                {saving ? "Guardando…" : "Guardar disponibilidad"}
              </button>
            </div>

            {/* Banner inferior (además del toast) */}
            {msg && <div className="mt-2 text-sm text-emerald-700">{msg}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- helpers ----------------- */

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function formatYMDHuman(ymd: string, locale = "es-MX") {
  // ymd: "YYYY-MM-DD"
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  if (isNaN(date.getTime())) return ymd;
  return date.toLocaleDateString(locale, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

function formatRangeLocal(startISO: string, endISO: string) {
  try {
    const s = new Date(startISO);
    const e = new Date(endISO);
    const fmt: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
    return `${s.toLocaleTimeString([], fmt)} - ${e.toLocaleTimeString([], fmt)}`;
  } catch {
    return `${startISO} - ${endISO}`;
  }
}

/**
 * Genera slots locales (sin 'Z') del tipo "YYYY-MM-DDTHH:mm:00"
 */
function buildSlots(dateYMD: string, startHHmm: string, endHHmm: string, intervalMins: number): Slot[] {
  const [sh, sm] = startHHmm.split(":").map(Number);
  const [eh, em] = endHHmm.split(":").map(Number);
  const start = new Date(`${dateYMD}T${pad2(sh)}:${pad2(sm)}:00`);
  const end = new Date(`${dateYMD}T${pad2(eh)}:${pad2(em)}:00`);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) throw new Error("Rango inválido");

  const out: Slot[] = [];
  let cur = new Date(start);
  while (cur < end) {
    const nxt = new Date(cur.getTime() + intervalMins * 60 * 1000);
    if (nxt > end) break;
    out.push({
      startISO: toLocalISO(cur),
      endISO: toLocalISO(nxt),
    });
    cur = nxt;
  }
  return out;
}

function toLocalISO(d: Date) {
  // "YYYY-MM-DDTHH:mm:SS" SIN Z (interpretable como local)
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
