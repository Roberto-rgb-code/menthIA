import React from "react";

export default function FiltersSidebar({
  type, setType, minRating, setMinRating, country, setCountry, area, setArea, onApply
}:{
  type: string; setType:(v:string)=>void;
  minRating: number; setMinRating:(n:number)=>void;
  country: string; setCountry:(v:string)=>void;
  area: string; setArea:(v:string)=>void;
  onApply: ()=>void;
}) {
  return (
    <aside className="bg-white rounded-xl border shadow-sm p-4 h-fit sticky top-24">
      <div className="font-semibold text-lg">Filtros</div>

      <div className="mt-4">
        <div className="font-medium text-sm">Tipo de Proveedor</div>
        <div className="mt-2 space-y-2 text-sm">
          {["", "consultor", "empresa", "freelancer"].map(v=>(
            <label key={v} className="flex items-center gap-2">
              <input type="radio" name="type" checked={type===v} onChange={()=>setType(v)} />
              <span>{v===""?"Todos":v[0].toUpperCase()+v.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="font-medium text-sm">Calificación mínima</div>
        <div className="mt-2 space-y-2 text-sm">
          {[0,3,4,4.5].map(r=>(
            <label key={r} className="flex items-center gap-2">
              <input type="radio" name="rating" checked={minRating===r} onChange={()=>setMinRating(r)} />
              <span>{r===0?"Cualquiera":`${r}★ o más`}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="font-medium text-sm">País</div>
        <input
          className="mt-2 w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="México, USA, …"
          value={country}
          onChange={(e)=>setCountry(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <div className="font-medium text-sm">Área de interés</div>
        <select className="mt-2 w-full border rounded-lg px-3 py-2 text-sm" value={area} onChange={(e)=>setArea(e.target.value)}>
          <option value="">Todas</option>
          {["Marketing","Finanzas","Tecnología e Internet","Data/Analytics","RRHH y Cultura","Contabilidad","Exportación","Innovación","Producto","Operaciones"].map(a=>(
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <button onClick={onApply} className="mt-5 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
        Aplicar filtros
      </button>
    </aside>
  );
}
