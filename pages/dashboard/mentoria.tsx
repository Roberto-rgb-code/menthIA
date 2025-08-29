// pages/dashboard/mentoria.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import PrivateLayout from "../../components/layout/PrivateLayout";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import MentorCard from "../../components/mentoria/MentorCard";
import ApplyMentorModal from "../../components/mentoria/ApplyMentorModal";
import BookingModal from "../../components/mentoria/BookingModal";
import MentorProfileModal from "../../components/mentoria/MentorProfileModal";
import AvailabilityModal from "../../components/mentoria/AvailabilityModal";
import {
  FiSearch,
  FiSliders,
  FiTrash2,
  FiUserPlus,
  FiCalendar,
  FiX,
  FiRefreshCw,
  FiList,
  FiGrid,
  FiInfo
} from "react-icons/fi";

const AREAS = [
  "Comercio electrónico","Desarrollo de negocios","Marca e identidad","Marketing","Publicidad y promoción",
  "Redes sociales","Finanzas","Contabilidad","Cadena de Suministro","Data/Analytics","Tecnología e Internet",
  "Legal y Cumplimiento","RRHH y Cultura","Exportación/Comercio Exterior","Innovación","Producto"
];

type ViewMode = "grid" | "list";
type SortBy = "relevance" | "top-rated" | "most-booked" | "newest";

/* ---------------------- Hooks utilitarios ---------------------- */
function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function useIsMounted() {
  const ref = useRef(false);
  useEffect(() => { ref.current = true; return () => { ref.current = false; }; }, []);
  return ref;
}

/* ============================== Vista ============================== */
export default function Mentoria() {
  const [uid, setUid] = useState("");
  const [displayName, setDisplayName] = useState<string>("");
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // filtros
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [area, setArea] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // UI/UX
  const [openApply, setOpenApply] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [openAvail, setOpenAvail] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [alreadyMentor, setAlreadyMentor] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("relevance");

  // búsqueda con debounce
  const qDeb = useDebouncedValue(q, 300);
  const countryDeb = useDebouncedValue(country, 300);
  const areaDeb = useDebouncedValue(area, 300);

  const mounted = useIsMounted();

  // -- auth
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUid(u?.uid || "");
      setDisplayName(u?.displayName || u?.email?.split("@")[0] || "");
    });
    setUid(auth.currentUser?.uid || "");
    setDisplayName(auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "");
    return () => unsub();
  }, []);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // -- cargar mentores (seguro contra carreras)
  const load = async (signal?: AbortSignal) => {
    if (!uid) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const base = new URL("/api/mentors", typeof window !== "undefined" ? window.location.origin : "http://localhost");
      base.searchParams.set("includeMe", "true");
      if (qDeb) base.searchParams.set("q", qDeb);
      if (countryDeb) base.searchParams.set("country", countryDeb);
      if (areaDeb) base.searchParams.set("area", areaDeb);
      if (sortBy) base.searchParams.set("sortBy", sortBy);

      const res = await fetch(base.pathname + "?" + base.searchParams.toString(), {
        headers: { "x-user-id": uid },
        signal,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Error ${res.status}`);
      }
      const data = await res.json();
      if (mounted.current) setMentors(data.items || []);
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error(e);
      if (mounted.current) {
        setMentors([]);
        setErrorMsg(e.message || "No se pudo cargar la lista");
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  // -- saber si ya soy mentor
  const checkMe = async () => {
    if (!uid) return;
    try {
      const r = await fetch("/api/mentors/me", { headers: { "x-user-id": uid } });
      const j = await r.json();
      setAlreadyMentor(j.item?.role === "mentor");
    } catch {
      setAlreadyMentor(false);
    }
  };

  // primera carga y cuando uid cambia
  useEffect(() => {
    if (!uid) return;
    const ac = new AbortController();
    load(ac.signal);
    checkMe();
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // recarga automática cuando cambien filtros (debounced)
  useEffect(() => {
    if (!uid) return;
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDeb, countryDeb, areaDeb, sortBy]);

  const onFilterApply = () => {
    setFiltersOpen(false);
    const ac = new AbortController();
    load(ac.signal);
  };

  const clearFilters = () => {
    setQ(""); setCountry(""); setArea("");
  };

  const deleteMyProfile = async () => {
    if (!uid) return;
    const ok = confirm("¿Eliminar tu perfil de mentor? Esta acción no se puede deshacer.");
    if (!ok) return;
    try {
      const res = await fetch("/api/mentors/delete", { method: "DELETE", headers: { "x-user-id": uid } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "No se pudo eliminar");
      }
      alert("Tu perfil de mentor se eliminó correctamente.");
      setAlreadyMentor(false);
      const ac = new AbortController();
      load(ac.signal);
    } catch (e: any) {
      alert(e.message || "Error al eliminar");
    }
  };

  const activeFilters = [
    q && { label: `Buscar: ${q}`, onClear: () => setQ("") },
    country && { label: `País: ${country}`, onClear: () => setCountry("") },
    area && { label: `Área: ${area}`, onClear: () => setArea("") },
  ].filter(Boolean) as { label: string; onClear: () => void }[];

  const resultsLabel = loading
    ? "Cargando…"
    : mentors.length === 0
      ? "Sin resultados"
      : `${mentors.length} resultado${mentors.length > 1 ? "s" : ""}`;

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-gradient-to-b from-white to-indigo-50/30">
        {/* Topbar */}
        <div className="bg-white/80 backdrop-blur border-b sticky top-0 z-[5]">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-lg">Mentoría</div>
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500">
                <FiInfo aria-hidden /> Encuentra a la persona ideal para tu reto
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Selector de vista */}
              <div className="hidden md:flex rounded-lg border overflow-hidden" role="tablist" aria-label="Modo de vista">
                <button
                  className={`px-3 py-2 text-sm inline-flex items-center gap-2 ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-50"}`}
                  onClick={() => setViewMode("grid")}
                  role="tab" aria-selected={viewMode === "grid"}
                  title="Vista de cuadrícula"
                >
                  <FiGrid /> Grid
                </button>
                <button
                  className={`px-3 py-2 text-sm inline-flex items-center gap-2 border-l ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-50"}`}
                  onClick={() => setViewMode("list")}
                  role="tab" aria-selected={viewMode === "list"}
                  title="Vista de lista"
                >
                  <FiList /> Lista
                </button>
              </div>

              {alreadyMentor && (
                <button
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
                  onClick={() => setOpenAvail(true)}
                  title="Configura horarios disponibles"
                >
                  <FiCalendar />
                  Mi disponibilidad
                </button>
              )}

              <button
                className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  alreadyMentor
                    ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
                onClick={() => !alreadyMentor && setOpenApply(true)}
                disabled={alreadyMentor}
                title={alreadyMentor ? "Ya eres mentor" : "Postúlate como mentor"}
              >
                <FiUserPlus />
                Postularme
              </button>

              {alreadyMentor && (
                <button
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50"
                  onClick={deleteMyProfile}
                  title="Eliminar tu perfil de mentor"
                >
                  <FiTrash2 />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          {/* Greeting + banner */}
          <div className="mt-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {greeting}{displayName ? `, ${displayName}` : "" }
            </h1>

            {/* Banner de conexión a Calendar */}
            {alreadyMentor && <ConnectGoogleBanner uid={uid} onAfterConnect={checkMe} />}
          </div>

          {/* Búsqueda y filtros */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-[1fr_210px_230px_auto] gap-3">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-indigo-200">
              <FiSearch className="text-gray-500 shrink-0" />
              <input
                className="w-full outline-none text-sm"
                placeholder="¿Con qué estás buscando ayuda? (p. ej., pricing, SEO, pitch)"
                aria-label="Buscar mentores"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
              />
              {q && (
                <button
                  className="rounded p-1 hover:bg-gray-100"
                  onClick={() => setQ("")}
                  aria-label="Limpiar búsqueda"
                  title="Limpiar"
                >
                  <FiX />
                </button>
              )}
            </div>

            <input
              className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200"
              placeholder="País (ej. México)"
              aria-label="Filtrar por país"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />

            <select
              className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-200"
              aria-label="Filtrar por área de interés"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            >
              <option value="">Área de interés</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
                onClick={() => setFiltersOpen(true)}
                title="Todos los filtros"
              >
                <FiSliders />
                <span>Todos los filtros</span>
              </button>

              {/* Ordenar por */}
              <select
                className="hidden md:block border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
                aria-label="Ordenar resultados"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                title="Ordenar por"
              >
                <option value="relevance">Relevancia</option>
                <option value="top-rated">Mejor valorados</option>
                <option value="most-booked">Más reservados</option>
                <option value="newest">Nuevos</option>
              </select>

              <button
                className="hidden md:inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50"
                onClick={() => { setQ(q); /* fuerza enter visual */ load(); }}
                title="Aplicar ahora"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Chips filtros activos */}
          {(activeFilters.length > 0 || !loading) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeFilters.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs hover:bg-indigo-100 transition"
                >
                  {f.label}
                  <button
                    className="rounded-full p-0.5 hover:bg-indigo-200"
                    onClick={() => { f.onClear(); }}
                    aria-label={`Quitar ${f.label}`}
                    title="Quitar filtro"
                  >
                    <FiX />
                  </button>
                </span>
              ))}
              {activeFilters.length > 0 && (
                <button
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                  onClick={clearFilters}
                  title="Limpiar todos los filtros"
                >
                  Limpiar filtros
                </button>
              )}
              <span className="ml-auto text-xs text-gray-500 inline-flex items-center gap-1">
                <FiRefreshCw className={loading ? "animate-spin" : ""} aria-hidden />
                {resultsLabel}
              </span>
            </div>
          )}

          {/* Error inline */}
          {errorMsg && (
            <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              {errorMsg}
              <button
                onClick={() => load()}
                className="ml-3 underline hover:opacity-80"
                title="Reintentar"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Grilla / Lista de mentores */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Mentores para ti</h2>

              {/* CTAs en móvil */}
              <div className="sm:hidden flex gap-2">
                {alreadyMentor && (
                  <button
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm border bg-white hover:bg-gray-50"
                    onClick={() => setOpenAvail(true)}
                  >
                    <FiCalendar /> Disponibilidad
                  </button>
                )}
                <button
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                    alreadyMentor ? "bg-gray-200 text-gray-600" : "bg-indigo-600 text-white"
                  }`}
                  onClick={() => !alreadyMentor && setOpenApply(true)}
                  disabled={alreadyMentor}
                >
                  <FiUserPlus /> Mentor
                </button>
              </div>
            </div>

            {/* Contenedor responsive según vista */}
            <div className={viewMode === "grid"
              ? "mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              : "mt-4 grid grid-cols-1 gap-3"}
            >
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : mentors.length > 0 ? (
                mentors.map((m) => (
                  <div key={`${m.userId}-${m.updatedAt || ""}`} className={viewMode === "list" ? "rounded-xl border bg-white p-4" : ""}>
                    <MentorCard
                      mentor={m}
                      onOpenProfile={(mm) => { setSelectedMentor(mm); setProfileOpen(true); }}
                      // Si tu MentorCard soporta props extras, aquí podrías pasar viewMode
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState onCreate={() => setOpenApply(true)} alreadyMentor={alreadyMentor} />
                </div>
              )}
            </div>

            <div className="py-10 text-center text-xs text-gray-500">
              © {new Date().getFullYear()} MentorApp. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {openApply && (
        <ApplyMentorModal open={openApply} onClose={() => setOpenApply(false)} onApplied={() => { load(); checkMe(); }} />
      )}
      {profileOpen && selectedMentor && (
        <MentorProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          mentor={selectedMentor}
          onBook={(m) => { setSelectedMentor(m); setProfileOpen(false); setOpenBooking(true); }}
        />
      )}
      {openBooking && selectedMentor && (
        <BookingModal
          open={openBooking}
          onClose={() => setOpenBooking(false)}
          mentor={selectedMentor}
        />
      )}
      {openAvail && (
        <AvailabilityModal open={openAvail} onClose={() => setOpenAvail(false)} />
      )}

      {/* Modal de filtros extra */}
      {filtersOpen && (
        <FiltersModal
          q={q} setQ={setQ}
          country={country} setCountry={setCountry}
          area={area} setArea={setArea}
          onClose={() => setFiltersOpen(false)}
          onApply={onFilterApply}
        />
      )}
    </PrivateLayout>
  );
}

/* ---------------------- Componentes auxiliares UI ---------------------- */

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="mt-3 flex gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-20" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onCreate, alreadyMentor }: { onCreate: () => void; alreadyMentor: boolean }) {
  return (
    <div className="rounded-xl border bg-white p-10 text-center">
      <div className="text-lg font-semibold">No encontramos mentores con esos filtros</div>
      <p className="text-sm text-gray-600 mt-1">
        Intenta cambiar tus criterios o explorar otras áreas.
      </p>
      {!alreadyMentor && (
        <button
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={onCreate}
        >
          <FiUserPlus />
          Crear mi perfil de mentor
        </button>
      )}
    </div>
  );
}

/* -------- Banner para conectar Google Calendar (solo mentores) -------- */

function ConnectGoogleBanner({ uid, onAfterConnect }: { uid: string; onAfterConnect?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!uid) return;
    (async () => {
      try {
        const res = await fetch("/api/google/status", { headers: { "x-user-id": uid } });
        const j = await res.json();
        setConnected(!!j.connected);
      } catch {
        setConnected(false);
      }
    })();
  }, [uid]);

  const start = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/google/oauth/start", { headers: { "x-user-id": uid } });
      const j = await r.json();
      if (j.url) window.location.href = j.url;
      onAfterConnect?.();
    } finally {
      setLoading(false);
    }
  };

  if (connected) return null;

  return (
    <div className="mt-4 rounded-xl border bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="text-sm text-gray-700">
        Conecta tu <b>Google Calendar</b> para que las reservas creen automáticamente
        un enlace de <b>Google Meet</b> y se envíen invitaciones.
      </div>
      <button
        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
        onClick={start}
        disabled={loading || !uid}
      >
        {loading ? "Abriendo…" : "Conectar Google Calendar"}
      </button>
    </div>
  );
}

/* -------------------- Modal de filtros adicionales -------------------- */

function FiltersModal({
  q, setQ, country, setCountry, area, setArea,
  onClose, onApply,
}: {
  q: string; setQ: (v: string) => void;
  country: string; setCountry: (v: string) => void;
  area: string; setArea: (v: string) => void;
  onClose: () => void; onApply: () => void;
}) {
  // cerrar con ESC
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Filtros de búsqueda">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Filtros de búsqueda</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose} aria-label="Cerrar filtros">✕</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={q}
              onChange={(e)=>setQ(e.target.value)}
              placeholder="Palabra clave"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={country}
              onChange={(e)=>setCountry(e.target.value)}
              placeholder="Ej. México"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Área de interés</label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={area}
              onChange={(e)=>setArea(e.target.value)}
            >
              <option value="">Seleccionar área</option>
              {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancelar</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={onApply}>
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
