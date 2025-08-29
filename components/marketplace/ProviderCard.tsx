import { Provider } from "../../types/marketplace";
import { FiMapPin, FiStar } from "react-icons/fi";

export default function ProviderCard({ p, onOpen }:{ p: Provider; onOpen:(p:Provider)=>void; }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden">
      <div className="h-36 w-full bg-gray-100 overflow-hidden">
        {p.coverUrl ? <img src={p.coverUrl} className="w-full h-full object-cover" alt={p.name} /> : null}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden border">
            {p.logoUrl ? <img src={p.logoUrl} className="w-full h-full object-cover" alt={p.name} /> : null}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {p.type}
              </span>
            </div>
            <div className="text-sm text-gray-500 line-clamp-1">{p.headline}</div>

            <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
              {p.country && <span className="inline-flex items-center gap-1"><FiMapPin/>{p.country}</span>}
              <span className="inline-flex items-center gap-1">
                <FiStar className="text-amber-500"/>{(p.ratingAvg || 0).toFixed(1)} · {p.ratingCount || 0}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(p.expertiseAreas || []).slice(0,3).map(a=>(
                <span key={a} className="text-xs px-2 py-1 rounded-full bg-gray-100 border">{a}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={()=>onOpen(p)}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Ver perfil
          </button>
          <a
            className="text-sm text-indigo-700 hover:underline"
            href={`/dashboard/marketplace/${encodeURIComponent(p.slug || p.providerId)}`}
          >
            Abrir detalle →
          </a>
        </div>
      </div>
    </div>
  );
}
