// components/mentoria/MentorProfileModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { getAuth } from "firebase/auth";

type Slot = { startISO: string; endISO: string };

export default function MentorProfileModal({
  open,
  onClose,
  mentor,
  onBook,
}: {
  open: boolean;
  onClose: () => void;
  mentor: any;
  onBook: (m: any) => void;
}) {
  if (!open || !mentor) return null;

  const {
    fullName,
    photoUrl,
    country,
    areasInteres = [],
    idiomas = [],
    porQueSoyMentor = "",
    comoPuedoAyudar = "",
    acercaDeMi = "",
    experiencia = "",
    hourlyRate = 0,
    rating = 0,
    sessionsCount = 0,
    userId,
    id,
  } = mentor;

  const mentorId = userId || id;
  const tz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  // Disponibilidad
  const today = new Date();
  const [monthStr, setMonthStr] = useState(toYM(today));
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [daySlots, setDaySlots] = useState<Slot[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Contact dialog
  const [contactOpen, setContactOpen] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);

  useEffect(() => {
    if (!open || !mentorId) return;
    loadMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mentorId, monthStr]);

  async function loadMonth() {
    setLoadingDays(true);
    setAvailableDays([]);
    setSelectedDate("");
    setDaySlots([]);
    try {
      const r = await fetch(`/api/availability/list?mentorId=${mentorId}&month=${encodeURIComponent(monthStr)}`);
      const j = await r.json();
      const days = (j.days || []) as string[];
      setAvailableDays(days);
      const first = pickFirstFromToday(days);
      if (first) {
        setSelectedDate(first);
        await loadDay(first);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDays(false);
    }
  }

  async function loadDay(ymd: string) {
    setLoadingSlots(true);
    setDaySlots([]);
    try {
      const r = await fetch(`/api/availability/list?mentorId=${mentorId}&date=${encodeURIComponent(ymd)}`);
      const j = await r.json();
      const slots = (j.slots || []) as Slot[];
      setDaySlots(slots);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSlots(false);
    }
  }

  function changeMonth(offset: number) {
    const [y, m] = monthStr.split("-").map(Number);
    const base = new Date(y, (m ?? 1) - 1 + offset, 1);
    setMonthStr(toYM(base));
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal
      aria-label="Ver perfil de mentor"
    >
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header sticky */}
        <div className="px-5 sm:px-6 py-4 border-b bg-white/90 backdrop-blur sticky top-0 z-10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">Perfil del mentor</h3>
          <button
            className="text-slate-500 hover:text-slate-700 rounded-lg px-2 py-1"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Grid contenido */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Identidad */}
          <div className="flex flex-col">
            <div className="flex flex-col rounded-xl bg-white shadow-sm">
              <div className="relative mt-6 mx-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 h-40 shadow">
                <div className="absolute left-6 -bottom-7 h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                  <img
                    src={photoUrl || "/avatar-placeholder.png"}
                    alt={fullName || "Mentor"}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="p-6 pt-10">
                <p className="text-slate-900 font-semibold text-xl">{fullName || "Mentor"}</p>
                <p className="text-slate-500 text-sm">{country || "—"}</p>

                <div className="mt-2 flex items-center gap-2 text-slate-600 text-sm">
                  <span>⭐ {rating || 0}</span>
                  <span className="text-slate-400">·</span>
                  <span>{sessionsCount || 0} sesiones</span>
                </div>

                {hourlyRate ? (
                  <div className="mt-2 inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-semibold border border-indigo-100">
                    ${hourlyRate}/h
                  </div>
                ) : null}

                {areasInteres?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {areasInteres.slice(0, 6).map((a: string) => (
                      <span
                        key={a}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700"
                      >
                        {a}
                      </span>
                    ))}
                    {areasInteres.length > 6 && (
                      <span className="text-[11px] text-slate-500">+{areasInteres.length - 6}</span>
                    )}
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => setContactOpen(true)}
                  >
                    Contactar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
                    onClick={() => onBook(mentor)}
                  >
                    Reservar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div className="lg:col-span-2 space-y-6">
            {/* Disponibilidad */}
            <div className="rounded-xl bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-slate-900 font-semibold text-lg">Disponibilidad</p>
                    <p className="text-slate-500 text-xs">Zona horaria: {tz}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => changeMonth(-1)}
                      className="w-8 h-8 grid place-items-center rounded-lg border hover:bg-slate-50"
                      title="Mes anterior"
                    >
                      ◀
                    </button>
                    <span className="font-semibold text-slate-700">{formatYMHuman(monthStr)}</span>
                    <button
                      type="button"
                      onClick={() => changeMonth(1)}
                      className="w-8 h-8 grid place-items-center rounded-lg border hover:bg-slate-50"
                      title="Mes siguiente"
                    >
                      ▶
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-sm text-slate-700 mb-2">Días con horarios</h5>
                  <div className="flex flex-wrap gap-2 min-h-[36px]">
                    {loadingDays ? (
                      <span className="text-slate-500 text-sm">Cargando…</span>
                    ) : availableDays.length === 0 ? (
                      <span className="text-slate-500 text-sm">Sin disponibilidad publicada.</span>
                    ) : (
                      availableDays.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            setSelectedDate(d);
                            loadDay(d);
                          }}
                          title={formatYMDHuman(d)}
                          className={[
                            "inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs border transition",
                            selectedDate === d
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-slate-800 border-slate-300 hover:border-indigo-400",
                          ].join(" ")}
                        >
                          {formatYMDShort(d)}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {!!selectedDate && (
                  <div className="mt-5">
                    <h5 className="font-medium text-sm text-slate-700 mb-2">
                      Horarios libres · {formatYMDHuman(selectedDate)}
                    </h5>
                    <div className="flex flex-wrap gap-2 min-h-[36px]">
                      {loadingSlots ? (
                        <span className="text-slate-500 text-sm">Cargando…</span>
                      ) : daySlots.length === 0 ? (
                        <span className="text-slate-500 text-sm">No hay horarios libres ese día.</span>
                      ) : (
                        daySlots.map((s) => (
                          <span
                            key={s.startISO + "|" + s.endISO}
                            title="Horario disponible"
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-xs border border-slate-300 bg-white text-slate-800"
                          >
                            {formatRangeLocal(s.startISO, s.endISO)}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t bg-slate-50/60 flex items-center justify-between rounded-b-xl">
                <p className="font-light text-[12px] text-slate-700 truncate">
                  {areasInteres?.length
                    ? `#${areasInteres[0]}${areasInteres[1] ? " · +" + (areasInteres.length - 1) : ""}`
                    : "#mentorapp"}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => setContactOpen(true)}
                  >
                    Contactar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm hover:bg-indigo-700"
                    onClick={() => onBook(mentor)}
                  >
                    Reservar
                  </button>
                </div>
              </div>
            </div>

            {/* Sobre la mentoría */}
            <div className="rounded-xl bg-white shadow-sm">
              <div className="p-6">
                <p className="text-slate-900 font-semibold text-lg">Sobre la mentoría</p>

                <Detail label="¿Por qué soy mentor?" body={porQueSoyMentor} />
                <Detail label="¿Cómo puedo ayudar?" body={comoPuedoAyudar} />
                <Detail label="Acerca de mí" body={acercaDeMi} />

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h6 className="font-semibold text-slate-800 mb-1">Idiomas</h6>
                    {idiomas?.length ? (
                      <ul className="list-disc ml-5 text-slate-700 text-sm">
                        {idiomas.map((i: string, idx: number) => (
                          <li key={idx}>{i}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-500 text-sm">—</p>
                    )}
                  </div>
                  <div>
                    <h6 className="font-semibold text-slate-800 mb-1">Experiencia</h6>
                    <p className="text-slate-700 whitespace-pre-line text-sm">{experiencia || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-5 right-5 z-50">
            <div
              className={`px-4 py-2 rounded-lg shadow text-white text-sm ${
                toast.kind === "ok" ? "bg-emerald-600" : "bg-rose-600"
              }`}
            >
              {toast.msg}
            </div>
          </div>
        )}
      </div>

      {/* Contact dialog */}
      {contactOpen && (
        <ContactDialog
          mentorId={mentorId}
          mentorName={fullName}
          onClose={() => setContactOpen(false)}
          onSent={() => {
            setContactOpen(false);
            setToast({ kind: "ok", msg: "Mensaje enviado al mentor ✅" });
            setTimeout(() => setToast(null), 2500);
          }}
          onError={(m) => {
            setToast({ kind: "err", msg: m || "No se pudo enviar el mensaje" });
            setTimeout(() => setToast(null), 3000);
          }}
        />
      )}
    </div>
  );
}

/* ---------------- Contact Dialog ---------------- */

function ContactDialog({
  mentorId,
  mentorName,
  onClose,
  onSent,
  onError,
}: {
  mentorId: string;
  mentorName?: string;
  onClose: () => void;
  onSent: () => void;
  onError: (msg?: string) => void;
}) {
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const auth = getAuth();
  const uid = auth.currentUser?.uid || "";

  async function send() {
    if (!uid) return onError("Debes iniciar sesión.");
    if (!msg.trim()) return onError("Escribe un mensaje.");
    setSending(true);
    try {
      const r = await fetch("/api/mentors/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": uid, // AUTH HEADER
        },
        body: JSON.stringify({ mentorId, message: msg }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo enviar");
      onSent();
    } catch (e: any) {
      onError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal
      aria-label="Contactar mentor"
    >
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div className="font-semibold">Contactar a {mentorName || "mentor"}</div>
          <button className="text-slate-500 hover:text-slate-700" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="p-5">
          <label className="block text-sm text-slate-700 mb-1">Mensaje</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm min-h-[120px]"
            maxLength={800}
            placeholder="Escribe un breve contexto u objetivo…"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
          />
          <div className="text-xs text-slate-400 mt-1">{800 - (msg?.length || 0)} restantes</div>
        </div>
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border hover:bg-slate-50" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            onClick={send}
            disabled={sending || !msg.trim()}
          >
            {sending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Subcomponentes ---------------- */

function Detail({ label, body }: { label: string; body: string }) {
  return (
    <section className="mt-4">
      <h6 className="font-semibold text-slate-800 mb-1">{label}</h6>
      <p className="text-slate-700 whitespace-pre-line text-sm">{body || "—"}</p>
    </section>
  );
}

/* ---------------- Helpers de fecha ---------------- */

function toYM(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatYMHuman(ym: string, locale = "es-MX") {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, (m ?? 1) - 1, 1);
  if (isNaN(d.getTime())) return ym;
  return d.toLocaleDateString(locale, { month: "long", year: "numeric" });
}
function formatYMDShort(ymd: string, locale = "es-MX") {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  if (isNaN(dt.getTime())) return ymd;
  return dt.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short" });
}
function formatYMDHuman(ymd: string, locale = "es-MX") {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  if (isNaN(dt.getTime())) return ymd;
  return dt.toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function pickFirstFromToday(days: string[]) {
  if (!days?.length) return "";
  const todayYMD = toYMD(new Date());
  const sorted = [...days].sort();
  for (const d of sorted) {
    if (d >= todayYMD) return d;
  }
  return sorted[0];
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
