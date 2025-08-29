// pages/dashboard/marketplace.tsx
import { useEffect, useState } from "react";
import PrivateLayout from "../../components/layout/PrivateLayout";
import { Provider } from "../../types/marketplace";
import SearchBar from "../../components/marketplace/SearchBar";
import FiltersSidebar from "../../components/marketplace/FiltersSidebar";
import ProviderCard from "../../components/marketplace/ProviderCard";
import ContactProviderModal from "../../components/marketplace/ContactProviderModal";
import ProviderEditorModal from "../../components/marketplace/ProviderEditorModal";
import ServiceEditorModal from "../../components/marketplace/ServiceEditorModal";
import MyServicesPanel from "../../components/marketplace/MyServicesPanel";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiCheckCircle, FiFilter, FiRefreshCcw } from "react-icons/fi";

const SERVICE_LIMIT = 10;

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-8 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [uid, setUid] = useState<string>("");
  const [authReady, setAuthReady] = useState<boolean>(false);

  // Filtros/búsqueda
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const [area, setArea] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<"rating"|"recent">("rating");

  // Listado
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Provider[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  // Contact modal
  const [contactOpen, setContactOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);

  // Mi perfil + servicios
  const [myProvider, setMyProvider] = useState<Provider | null>(null);
  const [mineLoading, setMineLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [justCreated, setJustCreated] = useState(false);
  const [myServicesCount, setMyServicesCount] = useState<number>(0);
  const [servicesRefreshKey, setServicesRefreshKey] = useState(0);

  // ====== AUTH ======
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (u) => {
      const newUid = u?.uid || "";
      setUid(newUid);
      (window as any)._uid = newUid; // para UploadImage
      setAuthReady(true);
      if (newUid) {
        await loadMine(newUid);
      } else {
        setMyProvider(null);
        setMyServicesCount(0);
        setMineLoading(false);
      }
    });
    return () => unsub();
  }, []);

  // ====== DATA LOADERS ======
  async function loadList(reset=false) {
    setLoading(true);
    try {
      const u = new URL("/api/marketplace/providers", window.location.origin);
      if (q) u.searchParams.set("q", q);
      if (type) u.searchParams.set("type", type);
      if (country) u.searchParams.set("country", country);
      if (area) u.searchParams.set("area", area);
      if (minRating) u.searchParams.set("minRating", String(minRating));
      if (!reset && cursor) u.searchParams.set("cursor", cursor);
      const r = await fetch(u.toString());
      const j = await r.json();
      const list: Provider[] = j.items || [];
      list.sort((a,b) => sortBy === "rating" ? (b.ratingAvg||0)-(a.ratingAvg||0) : (b.createdAt||0)-(a.createdAt||0));
      if (reset) setItems(list); else setItems(prev => [...prev, ...list]);
      setCursor(j.cursor);
    } finally { setLoading(false); }
  }

  async function loadMine(theUid: string) {
    setMineLoading(true);
    try {
      const r = await fetch("/api/marketplace/providers/mine", { headers: { "x-user-id": theUid } });
      const j = await r.json();
      const mine = j.item || null;
      setMyProvider(mine);

      if (mine) {
        const rc = await fetch(`/api/marketplace/services?providerId=${encodeURIComponent(mine.providerId)}&countOnly=1`);
        const jc = await rc.json();
        setMyServicesCount(jc.count || 0);
      } else {
        setMyServicesCount(0);
      }
    } finally {
      setMineLoading(false);
    }
  }

  // Inicial: cargar listado
  useEffect(()=>{ loadList(true); },[]);
  // Resort cuando cambia sortBy
  useEffect(()=>{ setCursor(undefined); loadList(true); }, [sortBy]);

  const onApplyFilters = () => { setCursor(undefined); loadList(true); };
  const clearFilters = () => { setQ(""); setType(""); setCountry(""); setArea(""); setMinRating(0); setCursor(undefined); loadList(true); };

  const openServiceWithLimit = async () => {
    if (!myProvider) return;
    const r = await fetch(`/api/marketplace/services?providerId=${encodeURIComponent(myProvider.providerId)}&countOnly=1`);
    const j = await r.json();
    const n = j.count || 0;
    if (n >= SERVICE_LIMIT) {
      alert(`Has alcanzado el límite de ${SERVICE_LIMIT} servicios publicados.`);
      return;
    }
    setServiceOpen(true);
  };

  const activeChips = [
    q && { k: "q", label: `Búsqueda: “${q}”`, clear: ()=>setQ("") },
    type && { k: "type", label: `Tipo: ${type}`, clear: ()=>setType("") },
    country && { k: "country", label: `País: ${country}`, clear: ()=>setCountry("") },
    area && { k: "area", label: `Área: ${area}`, clear: ()=>setArea("") },
    !!minRating && { k: "rating", label: `≥ ${minRating}★`, clear: ()=>setMinRating(0) },
  ].filter(Boolean) as {k:string;label:string;clear:()=>void}[];

  return (
    <PrivateLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white p-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Marketplace: Conecta con talento empresarial
          </h1>
          <p className="mt-3 text-white/90 max-w-3xl">
            Encuentra consultores y empresas para impulsar tu negocio. Publica tu perfil y ofrece tus servicios.
          </p>

        {/* Banner contextual */}
        <div className="mt-6 bg-white/10 backdrop-blur rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {!authReady || mineLoading ? (
            <div className="h-6 bg-white/20 rounded w-64 animate-pulse" />
          ) : !myProvider ? (
            <>
              <div className="text-sm sm:text-base">
                ¿Ofreces servicios empresariales? <b>Crea tu perfil</b> y empieza a recibir contactos.
              </div>
              <button
                className="px-4 py-2 rounded-lg bg-white text-indigo-700 hover:bg-gray-100"
                onClick={()=>setEditOpen(true)}
              >
                Crear mi perfil
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm sm:text-base">
                <FiCheckCircle className="text-emerald-300" />
                <span>Tu perfil <b>{myProvider.name}</b> está publicado.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-white/15 border border-white/20">
                  Servicios: {myServicesCount}/{SERVICE_LIMIT}
                </span>
                <button className="px-3 py-2 rounded-lg bg-white text-indigo-700 hover:bg-gray-100" onClick={()=>setEditOpen(true)}>
                  Editar perfil
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-emerald-400 text-white hover:bg-emerald-500 disabled:opacity-60"
                  onClick={openServiceWithLimit}
                  disabled={myServicesCount >= SERVICE_LIMIT}
                >
                  Publicar servicio
                </button>
                <a
                  className="px-3 py-2 rounded-lg bg-white/0 border border-white/30 hover:bg-white/10"
                  href={`/dashboard/marketplace/${encodeURIComponent(myProvider.slug || myProvider.providerId)}`}
                >
                  Ver mi perfil →
                </a>
              </div>
            </>
          )}
        </div>
        </section>

        {/* Búsqueda */}
        <div className="mt-6">
          <SearchBar value={q} onChange={setQ} onSearch={()=>{ setCursor(undefined); loadList(true); }} />
        </div>

        {/* Toolbar */}
        <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <FiFilter /> Filtros activos:
            </div>
            {activeChips.length === 0 ? (
              <span className="text-sm text-gray-400">ninguno</span>
            ) : activeChips.map(ch => (
              <button
                key={ch.k}
                className="text-xs px-2 py-1 rounded-full border bg-white hover:bg-gray-50"
                onClick={()=>{ ch.clear(); setCursor(undefined); loadList(true); }}
              >
                {ch.label} ✕
              </button>
            ))}
            {activeChips.length > 0 && (
              <button className="text-xs px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 border" onClick={clearFilters}>
                Limpiar todo
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ordenar por</span>
            <select
              className="text-sm border rounded-lg px-2 py-1"
              value={sortBy}
              onChange={(e)=>setSortBy(e.target.value as any)}
            >
              <option value="rating">Mejor calificados</option>
              <option value="recent">Más recientes</option>
            </select>
            <button className="ml-2 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              onClick={()=>{ setCursor(undefined); loadList(true); }}>
              <FiRefreshCcw /> Actualizar
            </button>
          </div>
        </div>

        {/* Layout: filtros + listado */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6">
          <FiltersSidebar
            type={type} setType={setType}
            minRating={minRating} setMinRating={setMinRating}
            country={country} setCountry={setCountry}
            area={area} setArea={setArea}
            onApply={()=>{ setCursor(undefined); loadList(true); }}
          />

          <section>
            {loading && items.length===0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({length:6}).map((_,i)=><SkeletonCard key={i}/>)}
              </div>
            ) : items.length===0 ? (
              <div className="rounded-xl border bg-white p-10 text-center">
                <div className="text-lg font-semibold">No encontramos proveedores</div>
                <div className="text-sm text-gray-600">Ajusta filtros o intenta otra búsqueda.</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {items.map(p=>(
                    <ProviderCard
                      key={p.providerId}
                      p={p}
                      onOpen={(pp)=>{ setSelectedProvider(pp); setContactOpen(true); }}
                    />
                  ))}
                </div>

                {cursor && (
                  <div className="mt-6 text-center">
                    <button
                      className="px-4 py-2 rounded-lg bg-gray-100 border hover:bg-gray-50"
                      onClick={()=>loadList(false)}
                    >
                      Cargar más
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {/* Panel de mis servicios */}
        {myProvider && (
          <MyServicesPanel
            providerId={myProvider.providerId}
            uid={uid}
            limit={SERVICE_LIMIT}
            refreshKey={servicesRefreshKey}
            onAddNew={()=>{
              if (myServicesCount >= SERVICE_LIMIT) {
                alert(`Has alcanzado el límite de ${SERVICE_LIMIT} servicios publicados.`);
                return;
              }
              setServiceOpen(true);
            }}
            onChanged={()=>{
              (async ()=>{
                const rc = await fetch(`/api/marketplace/services?providerId=${encodeURIComponent(myProvider.providerId)}&countOnly=1`);
                const jc = await rc.json();
                setMyServicesCount(jc.count || 0);
                setServicesRefreshKey(k => k + 1);
              })();
            }}
          />
        )}
      </div>

      {/* Modales */}
      <ContactProviderModal
        open={contactOpen}
        onClose={()=>setContactOpen(false)}
        providerId={selectedProvider?.providerId || ""}
      />
      <ProviderEditorModal
        open={editOpen}
        onClose={(saved)=>{
          setEditOpen(false);
          if (saved) {
            const wasNull = !myProvider;
            setMyProvider(saved);
            if (wasNull) setJustCreated(true);
            (async()=>{
              const rc = await fetch(`/api/marketplace/services?providerId=${encodeURIComponent(saved.providerId)}&countOnly=1`);
              const jc = await rc.json();
              setMyServicesCount(jc.count || 0);
              setServicesRefreshKey(k => k + 1);
            })();
          }
        }}
        uid={uid}
        current={myProvider}
      />
      {myProvider && (
        <ServiceEditorModal
          open={serviceOpen}
          onClose={(saved)=>{
            setServiceOpen(false);
            if (saved) {
              setMyServicesCount(c => Math.min(c+1, SERVICE_LIMIT));
              setServicesRefreshKey(k => k + 1);
            }
          }}
          uid={uid}
          providerId={myProvider.providerId}
        />
      )}
    </PrivateLayout>
  );
}
