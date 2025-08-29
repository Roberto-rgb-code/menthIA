// components/marketplace/ServiceEditorModal.tsx
import { useMemo, useState } from "react";
import UploadImage from "./UploadImage";

const CATEGORIES = ["General","Estrategia","Marketing","Ventas","Finanzas","Operaciones","Tecnología","Data/Analytics","RRHH"];

export default function ServiceEditorModal({
  open, onClose, uid, providerId
}:{
  open: boolean; onClose: (saved?: any)=>void; uid: string; providerId: string;
}) {
  const draftServiceId = useMemo(()=> (typeof crypto !== "undefined" && (crypto as any).randomUUID) ? (crypto as any).randomUUID() : `svc_${Date.now()}`, []);
  const [form, setForm] = useState<any>({
    providerId, serviceId: draftServiceId,
    title: "", description: "", category: "General",
    tags: [] as string[],
    priceFrom: 0, priceUnit: "proyecto",
    deliveryTimeDays: 0, images: [] as string[],
    active: true,
  });
  const [saving, setSaving] = useState(false);

  if (!open) return null;
  const addImg = (url: string) => setForm((f:any)=>({ ...f, images: [...f.images, url] }));

  const save = async () => {
    if (!form.title.trim()) return alert("Ponle un título al servicio.");
    setSaving(true);
    try {
      const r = await fetch("/api/marketplace/services", {
        method: "POST",
        headers: { "Content-Type":"application/json", "x-user-id": uid },
        body: JSON.stringify({ ...form, providerId, category: form.category || "General" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo guardar");
      onClose(j.item); // <- devolvemos el item creado
    } catch (e:any) {
      alert(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Nuevo servicio</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={()=>onClose()}>✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Título</label>
            <input className="w-full border rounded-lg px-3 py-2"
              value={form.title} onChange={(e)=>setForm({...form, title: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-600">Descripción</label>
            <textarea className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
              value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Categoría</label>
            <select className="w-full border rounded-lg px-3 py-2"
              value={form.category} onChange={(e)=>setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Desde (precio)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2"
              value={form.priceFrom} onChange={(e)=>setForm({...form, priceFrom: Number(e.target.value)||0})} />
          </div>
          <div>
            <label className="text-sm text-gray-600">Unidad</label>
            <select className="w-full border rounded-lg px-3 py-2"
              value={form.priceUnit} onChange={(e)=>setForm({...form, priceUnit: e.target.value})}>
              {["hora","proyecto","sesión","mensual"].map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Tiempo de entrega (días)</label>
            <input type="number" className="w-full border rounded-lg px-3 py-2"
              value={form.deliveryTimeDays} onChange={(e)=>setForm({...form, deliveryTimeDays: Number(e.target.value)||0})} />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <UploadImage
                pathHint={`services/${providerId}/${draftServiceId}/img-${Date.now()}`}
                label="Subir imagen"
                onUploaded={addImg}
              />
              <div className="text-xs text-gray-500">Puedes subir varias. Repite el botón.</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.images.map((u:string, i:number)=>(
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={u} className="h-16 w-24 object-cover rounded border" alt={`img${i}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={()=>onClose()}>Cancelar</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            onClick={save} disabled={saving}>
            {saving ? "Guardando…" : "Publicar servicio"}
          </button>
        </div>
      </div>
    </div>
  );
}
