import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PrivateLayout from "../../../components/layout/PrivateLayout";
import { Provider } from "../../../types/marketplace";
import ServiceList from "../../../components/marketplace/ServiceList";
import ContactProviderModal from "../../../components/marketplace/ContactProviderModal";
import { FiMapPin, FiStar } from "react-icons/fi";

export default function ProviderProfilePage() {
  const router = useRouter();
  const { slug } = router.query;
  const [p, setP] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(()=>{
    if (!slug) return;
    (async()=>{
      try{
        const r = await fetch(`/api/marketplace/providers/${slug}`);
        const j = await r.json();
        setP(j.item || null);
      } finally { setLoading(false); }
    })();
  },[slug]);

  return (
    <PrivateLayout>
      {loading ? (
        <div className="container mx-auto px-4 py-8">Cargando…</div>
      ) : !p ? (
        <div className="container mx-auto px-4 py-8">Proveedor no encontrado.</div>
      ) : (
        <div>
          <div className="h-56 w-full bg-gray-100 relative">
            {p.coverUrl && <img src={p.coverUrl} className="w-full h-full object-cover" alt={p.name} />}
            <div className="container mx-auto px-4">
              <div className="absolute -bottom-8 flex items-end gap-4">
                <div className="h-24 w-24 rounded-full bg-white border overflow-hidden">
                  {p.logoUrl && <img src={p.logoUrl} className="w-full h-full object-cover" alt={p.name} />}
                </div>
                <div className="pb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{p.name}</h1>
                  <div className="text-sm text-gray-600 flex items-center gap-3">
                    {p.country && <span className="inline-flex items-center gap-1"><FiMapPin/>{p.country}</span>}
                    <span className="inline-flex items-center gap-1"><FiStar className="text-amber-500"/>{(p.ratingAvg||0).toFixed(1)} · {p.ratingCount||0}</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{p.type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <div className="h-10" />
            <div className="flex items-center justify-between">
              <div className="text-gray-600">{p.headline}</div>
              <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={()=>setContactOpen(true)}>
                Contactar
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
              <main className="space-y-8">
                {p.bio && (
                  <section>
                    <h2 className="text-xl font-semibold">Acerca de</h2>
                    <p className="mt-2 text-gray-700 whitespace-pre-line">{p.bio}</p>
                  </section>
                )}

                <section>
                  <h2 className="text-xl font-semibold">Servicios ofrecidos</h2>
                  <div className="mt-3">
                    <ServiceList providerId={p.providerId} />
                  </div>
                </section>
              </main>

              <aside className="space-y-4">
                {p.expertiseAreas?.length ? (
                  <div className="rounded-xl border bg-white p-4">
                    <div className="font-medium">Áreas de experiencia</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.expertiseAreas.map(a=>(
                        <span key={a} className="text-xs px-2 py-1 rounded-full bg-gray-100 border">{a}</span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {p.languages?.length ? (
                  <div className="rounded-xl border bg-white p-4">
                    <div className="font-medium">Idiomas</div>
                    <div className="mt-2 text-sm text-gray-700">{p.languages.join(", ")}</div>
                  </div>
                ) : null}
              </aside>
            </div>
          </div>
        </div>
      )}

      {p && (
        <ContactProviderModal open={contactOpen} onClose={()=>setContactOpen(false)} providerId={p.providerId}/>
      )}
    </PrivateLayout>
  );
}
