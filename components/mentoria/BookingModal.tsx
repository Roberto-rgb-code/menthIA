// components/mentoria/BookingModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useCart } from "@/contexts/CartContext"; // ajusta ruta si fuera necesario

type Props = {
  open: boolean;
  onClose: () => void;
  mentor: any; // { userId, fullName, photoUrl, country, hourlyRate, ... }
};

export default function BookingModal({ open, onClose, mentor }: Props) {
  const auth = getAuth();
  const router = useRouter();
  const { addItem } = useCart();

  const uid = auth.currentUser?.uid || "";
  const menteeEmail = auth.currentUser?.email || "";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Calendario
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(toYMD(today));
  const [monthDays, setMonthDays] = useState<string[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  // Slots del día seleccionado
  const [slots, setSlots] = useState<Array<{ startISO: string; endISO: string }>>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ startISO: string; endISO: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [infoAfterPay, setInfoAfterPay] = useState<string | null>(null);

  // Tipo de mentoría (ajusta tu lógica)
  const [kindMentoria, setKindMentoria] = useState<"mentoria_jr" | "mentoria_sr">(
    mentor?.hourlyRate && mentor.hourlyRate >= 1000 ? "mentoria_sr" : "mentoria_jr"
  );

  // Precios en **pesos** (MXN). Se convertirán a **centavos** al agregar al carrito.
  const PRICE_BY_KIND_PESOS: Record<"mentoria_jr" | "mentoria_sr", number> = {
    mentoria_jr: 499,  // <-- ajusta a tus tarifas reales
    mentoria_sr: 899,
  };

  // ------ Disponibilidad: mes en vista ------
  useEffect(() => {
    if (!open || !mentor?.userId) return;
    (async () => {
      setLoadingMonth(true);
      try {
        const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;
        const url = new URL("/api/availability/list", window.location.origin);
        url.searchParams.set("mentorId", mentor.userId);
        url.searchParams.set("month", monthStr);
        const r = await fetch(url.toString());
        const j = await r.json();
        setMonthDays(Array.isArray(j.days) ? j.days : []);
      } catch {
        setMonthDays([]);
      } finally {
        setLoadingMonth(false);
      }
    })();
  }, [open, mentor?.userId, viewYear, viewMonth]);

  // ------ Slots del día elegido ------
  useEffect(() => {
    if (!open || !mentor?.userId || !selectedDate) return;
    (async () => {
      setLoadingSlots(true);
      try {
        const url = new URL("/api/availability/list", window.location.origin);
        url.searchParams.set("mentorId", mentor.userId);
        url.searchParams.set("date", selectedDate);
        const r = await fetch(url.toString());
        const j = await r.json();
        setSlots(Array.isArray(j.slots) ? j.slots : []);
        setSelectedSlot(null);
      } catch {
        setSlots([]);
        setSelectedSlot(null);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [open, mentor?.userId, selectedDate]);

  const daysGrid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const last = new Date(viewYear, viewMonth + 1, 0);
    const startWeekday = (first.getDay() + 6) % 7; // lunes=0
    const total = startWeekday + last.getDate();
    const rows = Math.ceil(total / 7);
    const cells: Array<{ ymd?: string; inMonth: boolean; hasSlots: boolean }> = [];
    for (let i = 0; i < rows * 7; i++) {
      const day = i - startWeekday + 1;
      if (day < 1 || day > last.getDate()) {
        cells.push({ inMonth: false, hasSlots: false });
      } else {
        const ymd = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        cells.push({ ymd, inMonth: true, hasSlots: monthDays.includes(ymd) });
      }
    }
    return { cells, monthLabel: monthName(viewMonth) + " " + viewYear };
  }, [viewYear, viewMonth, monthDays]);

  // (Opcional) Confirmar sin pago
  const onConfirm = async () => {
    if (!selectedSlot) return;
    if (!uid) return alert("Debes iniciar sesión.");
    if (!menteeEmail) return alert("Tu usuario no tiene email. Completa tu email en el perfil.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify({
          mentorId: mentor.userId,
          startISO: selectedSlot.startISO,
          endISO: selectedSlot.endISO,
          timezone: tz,
          notes,
          menteeEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.code === "mentor_calendar_not_connected") {
          alert("Este mentor aún no conectó Google Calendar. Intenta con otro mentor o pídale que lo conecte.");
          return;
        }
        throw new Error(data.error || "No se pudo crear la reserva.");
      }
      setInfoAfterPay("Reserva creada sin pago (modo legacy). Recomendado usar 'Pagar y reservar'.");
    } catch (e: any) {
      alert(e.message || "Error al reservar");
    } finally {
      setSubmitting(false);
    }
  };

  // -------- NUEVO: Agregar al carrito (usa kind + priceCents) y redirigir a /cart --------
  function skuMentoria(args: { mentorId: string; date: string; slot: string; kind: "mentoria_jr" | "mentoria_sr" }) {
    return `mentoria:${args.mentorId}:${args.date}:${args.slot}:${args.kind}`;
  }

  const handlePayAndReserveViaCart = () => {
    if (!selectedSlot) return alert("Elige un horario.");
    if (!uid) return alert("Debes iniciar sesión.");

    const start = selectedSlot.startISO;
    const end = selectedSlot.endISO;
    const fechaYMD = selectedDate;
    const hourLabel = formatRangeLocal(start, end);

    // convierte PESOS -> CENTAVOS
    const pricePesos = PRICE_BY_KIND_PESOS[kindMentoria];
    const priceCents = Math.round(pricePesos * 100);

    const id = skuMentoria({
      mentorId: mentor.userId,
      date: fechaYMD,
      slot: `${start}-${end}`,
      kind: kindMentoria,
    });

    addItem({
      id,
      kind: "mentoria",
      title: `Sesión de Mentoría • ${kindMentoria === "mentoria_jr" ? "Mentoría Jr" : "Mentoría Sr"}`,
      priceCents,
      quantity: 1,
      image: "/images/products/mentoria.png",
      meta: {
        mentorId: mentor.userId,
        mentorName: mentor?.fullName || "",
        date: fechaYMD,
        slotStart: start,
        slotEnd: end,
        slotLabel: hourLabel,
        plan: kindMentoria,
        timezone: tz,
        notes,
      },
    });

    const ret = encodeURIComponent("/dashboard/mentoria");
    router.push(`/cart?ret=${ret}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">Reservar con {mentor?.fullName || "Mentor"}</h3>
            <p className="text-sm text-gray-500">Zona horaria detectada: <b>{tz}</b></p>
          </div>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendario */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                className="px-3 py-1 rounded border hover:bg-gray-50"
                onClick={() => {
                  const d = new Date(viewYear, viewMonth - 1, 1);
                  setViewYear(d.getFullYear());
                  setViewMonth(d.getMonth());
                }}
              >
                ←
              </button>
              <div className="font-semibold">{daysGrid.monthLabel}</div>
              <button
                className="px-3 py-1 rounded border hover:bg-gray-50"
                onClick={() => {
                  const d = new Date(viewYear, viewMonth + 1, 1);
                  setViewYear(d.getFullYear());
                  setViewMonth(d.getMonth());
                }}
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 text-xs text-gray-500 mb-1 px-1">
              {["L", "M", "M", "J", "V", "S", "D"].map((d) => (
                <div key={d} className="text-center py-1">{d}</div>
              ))}
            </div>

            <div className={`grid grid-cols-7 gap-1 ${loadingMonth ? "opacity-60" : ""}`}>
              {daysGrid.cells.map((c, idx) => {
                const isSelected = c.ymd && c.ymd === selectedDate;
                return (
                  <button
                    key={idx}
                    disabled={!c.inMonth}
                    onClick={() => c.ymd && setSelectedDate(c.ymd)}
                    className={`h-10 rounded-lg text-sm
                      ${!c.inMonth ? "bg-transparent" :
                        isSelected ? "bg-indigo-600 text-white" :
                        "bg-white border hover:bg-gray-50"}`}
                    title={c.hasSlots ? "Hay horarios disponibles" : ""}
                  >
                    {c.inMonth ? Number(c.ymd!.split("-")[2]) : ""}
                    {c.hasSlots && c.inMonth && !isSelected && (
                      <div className="mt-0.5">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horarios */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm text-gray-500">Fecha seleccionada</div>
                <div className="font-semibold">{formatYMDHuman(selectedDate)}</div>
              </div>

              {/* Selector del tipo de mentoría */}
              <select
                className="px-3 py-2 rounded-lg border text-sm"
                value={kindMentoria}
                onChange={(e) => setKindMentoria(e.target.value as "mentoria_jr" | "mentoria_sr")}
                title="Tipo de mentoría"
              >
                <option value="mentoria_jr">Mentoría Jr</option>
                <option value="mentoria_sr">Mentoría Sr</option>
              </select>
            </div>

            <div className="min-h-[140px]">
              {loadingSlots ? (
                <div className="text-sm text-gray-500">Cargando horarios…</div>
              ) : slots.length === 0 ? (
                <div className="rounded-lg border bg-white p-4 text-sm text-gray-600">
                  No hay slots para esta fecha. Prueba otro día del calendario.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {slots.map((s) => {
                    const label = formatRangeLocal(s.startISO, s.endISO);
                    const isSel = selectedSlot?.startISO === s.startISO && selectedSlot?.endISO === s.endISO;
                    return (
                      <button
                        key={s.startISO}
                        onClick={() => setSelectedSlot(s)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition
                          ${isSel ? "bg-indigo-600 text-white border-indigo-600" : "bg-white hover:border-indigo-400"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas para el mentor (opcional)</label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={3}
                maxLength={600}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Cuéntale brevemente tu objetivo de esta sesión…"
              />
              <div className="text-xs text-gray-400 mt-1">{600 - notes.length} caracteres restantes</div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancelar</button>

              {/* (Opcional / Admin) Confirmar sin pago */}
              {/*
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700"
                onClick={onConfirm}
                disabled={!selectedSlot || submitting}
              >
                {submitting ? "Reservando…" : "Confirmar (sin pago)"}
              </button>
              */}

              <button
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                onClick={handlePayAndReserveViaCart}
                disabled={!selectedSlot}
                title={!selectedSlot ? "Elige un horario" : "Pagar y reservar"}
              >
                Pagar y reservar
              </button>
            </div>

            {infoAfterPay && (
              <div className="mt-4 rounded-lg border bg-amber-50 text-amber-900 p-3 text-sm">
                {infoAfterPay}
              </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
              Tras el pago te redirigiremos. La reserva se confirmará automáticamente y te llegará el enlace del evento (Google
              Calendar/Meet si el mentor lo tiene conectado).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------- helpers ------------------- */

function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthName(m: number) {
  return [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ][m];
}

function formatYMDHuman(ymd?: string) {
  if (!ymd) return "";
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} ${monthName(m - 1)} ${y}`;
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
