import React, { useEffect, useMemo, useState } from "react";
import UploadImage from "./UploadImage";

const LANGS = ["Español","Inglés","Portugués","Francés","Alemán","Italiano"];
const AREAS = ["Marketing","Finanzas","Tecnología e Internet","Data/Analytics","RRHH y Cultura","Contabilidad","Operaciones","Innovación","Producto","Exportación"];

type ProviderForm = {
  providerId: string;
  name: string;
  type: "consultor" | "empresa" | "freelancer";
  headline: string;
  country: string;
  languages: string[];
  expertiseAreas: string[];
  bio: string;
  priceRange: { min: number; max: number; currency: string };
  logoUrl: string;
  coverUrl: string;
  status: "active" | "inactive";
  userId?: string; // para que también quede en el item
};

export default function ProviderEditorModal({
  open, onClose, uid, current
}:{
  open: boolean; onClose: (saved?: any)=>void; uid: string; current?: any | null;
}) {
  // 👉 Clave: por defecto usamos el uid como providerId (estable y recuperable)
  const draftId = useMemo(() => {
    if (current?.providerId) return current.providerId;
    if (uid) return uid;
    // fallback por si no hay uid aún (no debería pasar dentro del modal abierto)
    const rand = typeof crypto !== "undefined" && (crypto as any).randomUUID
      ? (crypto as any).randomUUID()
      : `prov_${Date.now()}`;
    return rand;
  }, [current, uid]);

  const [form, setForm] = useState<ProviderForm>({
    providerId: draftId,
    name: "",
    type: "consultor",
    headline: "",
    country: "",
    languages: [],
    expertiseAreas: [],
    bio: "",
    priceRange: { min: 0, max: 0, currency: "MXN" },
    logoUrl: "",
    coverUrl: "",
    status: "active",
    userId: uid, // guardamos también el userId en el item
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (current) {
      setForm(prev => ({
        ...prev,
        ...current,
        providerId: current.providerId || draftId,
        userId: uid,
        priceRange: current.priceRange || prev.priceRange,
        languages: current.languages || [],
        expertiseAreas: current.expertiseAreas || [],
      }));
    } else {
      setForm(prev => ({ ...prev, providerId: draftId, userId: uid }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, draftId, uid]);

  if (!open) return null;

  const set = <K extends keyof ProviderForm>(key: K, value: ProviderForm[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleInArr = (key: "languages"|"expertiseAreas", val: string) => {
    setForm((f:any)=>{
      const arr = new Set<string>(f[key] || []);
      arr.has(val) ? arr.delete(val) : arr.add(val);
      return { ...f, [key]: Array.from(arr) };
    });
  };

  const save = async () => {
    if (!form.name.trim()) return alert("Ponle un nombre a tu perfil.");
    setSaving(true);
    try {
      const r = await fetch("/api/marketplace/providers", {
        method: "POST",
        headers: { "Content-Type":"application/json", "x-user-id": uid },
        body: JSON.stringify({ ...form, providerId: draftId, userId: uid }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo guardar");
      onClose(j.item);
    } catch (e:any) {
      alert(e.message || "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="mt-0 flex flex-col bg-gray-100 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-black font-bold text-lg">Perfil del Marketplace</h2>
            <button
              onClick={()=>onClose()}
              className="bg-white text-black rounded-md px-3 py-1 hover:bg-gray-200 hover:text-gray-900"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {/* Logo & Cover */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3">
              <UploadImage
                pathHint={`providers/${draftId}/logo`}
                label="Subir logo"
                onUploaded={(url)=>set("logoUrl", url)}
              />
              {form.logoUrl ? (
                <img src={form.logoUrl} className="h-12 w-12 rounded-full object-cover border border-gray-300" alt="logo" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-white border border-gray-300 grid place-items-center text-black text-xs">Logo</div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <UploadImage
                pathHint={`providers/${draftId}/cover`}
                label="Subir portada"
                onUploaded={(url)=>set("coverUrl", url)}
              />
              {form.coverUrl ? (
                <img src={form.coverUrl} className="h-12 w-20 object-cover border border-gray-300 rounded" alt="cover" />
              ) : (
                <div className="h-12 w-20 rounded bg-white border border-gray-300 grid place-items-center text-black text-xs">Portada</div>
              )}
            </div>
          </div>

          {/* Identidad */}
          <div className="mt-4">
            <h3 className="text-black font-semibold text-base">Identidad</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="text-black text-sm">Nombre / Razón social</label>
                <input
                  className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2"
                  value={form.name}
                  onChange={(e)=>set("name", e.target.value)}
                />
              </div>
              <div>
                <label className="text-black text-sm">Tipo</label>
                <select
                  className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2"
                  value={form.type}
                  onChange={(e)=>set("type", e.target.value as ProviderForm["type"])}
                >
                  <option value="consultor">Consultor</option>
                  <option value="empresa">Empresa</option>
                  <option value="freelancer">Freelancer</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-black text-sm">Titular / Headline</label>
                <input
                  className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2"
                  placeholder="Ej. Estrategia y crecimiento para PyMEs"
                  value={form.headline}
                  onChange={(e)=>set("headline", e.target.value)}
                />
              </div>
              <div>
                <label className="text-black text-sm">País</label>
                <input
                  className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2"
                  value={form.country}
                  onChange={(e)=>set("country", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Acerca de */}
          <div className="mt-4">
            <h3 className="text-black font-semibold text-base">Acerca de</h3>
            <div className="mt-3">
              <label className="text-black text-sm">Descripción</label>
              <textarea
                className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2 min-h-[120px]"
                value={form.bio}
                onChange={(e)=>set("bio", e.target.value)}
                maxLength={600}
              />
              <div className="text-xs text-black/70 mt-1">
                {(600 - (form.bio?.length || 0))} caracteres restantes
              </div>
            </div>
          </div>

          {/* Idiomas */}
          <div className="mt-4">
            <h3 className="text-black font-semibold text-base">Idiomas</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {LANGS.map(l => {
                const active = form.languages?.includes(l);
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={()=>toggleInArr("languages", l)}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-black border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Áreas de experiencia */}
          <div className="mt-4">
            <h3 className="text-black font-semibold text-base">Áreas de experiencia</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {AREAS.map(a => {
                const active = form.expertiseAreas?.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={()=>toggleInArr("expertiseAreas", a)}
                    className={`text-xs px-3 py-1 rounded-full border ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-black border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Precios */}
          <div className="mt-4">
            <h3 className="text-black font-semibold text-base">Rango de precios</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-black text-sm">Moneda</label>
                <select
                  className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2"
                  value={form.priceRange?.currency || "MXN"}
                  onChange={(e)=>set("priceRange", { ...(form.priceRange||{}), currency: e.target.value })}
                >
                  {["MXN","USD","EUR","COP","ARS","CLP","PEN","BRL"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-black text-sm">Desde (precio)</label>
                <input
                  type="number"
                  className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2"
                  value={form.priceRange?.min || 0}
                  onChange={(e)=>set("priceRange", { ...(form.priceRange||{}), min: Number(e.target.value)||0 })}
                />
              </div>
              <div>
                <label className="text-black text-sm">Hasta (precio)</label>
                <input
                  type="number"
                  className="w-full bg-white rounded-md border border-gray-300 text-black px-3 py-2"
                  value={form.priceRange?.max || 0}
                  onChange={(e)=>set("priceRange", { ...(form.priceRange||{}), max: Number(e.target.value)||0 })}
                />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-6 flex justify-end gap-2">
            <button
              className="bg-white text-black rounded-md px-4 py-1 hover:bg-gray-200 hover:text-gray-900"
              onClick={()=>onClose()}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="rounded-md px-4 py-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
              onClick={save}
              disabled={saving}
              type="button"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
