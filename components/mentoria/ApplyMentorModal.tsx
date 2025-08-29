import React, { useEffect, useMemo, useRef, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const AREAS = [
  "Comercio electrónico","Desarrollo de negocios","Marca e identidad","Marketing","Publicidad y promoción",
  "Redes sociales","Finanzas","Contabilidad","Cadena de Suministro","Data/Analytics","Tecnología e Internet",
  "Legal y Cumplimiento","RRHH y Cultura","Exportación/Comercio Exterior","Innovación","Producto"
];

const IDIOMAS_OPCIONES = [
  "Español","Inglés","Francés","Alemán","Portugués","Italiano","Chino (Mandarín)","Japonés",
];

type Props = { open: boolean; onClose: () => void; onApplied: () => void; };

// —— Tokens de estilo (consistencia) ——
const C = {
  card: "rounded-2xl border border-white/30 bg-white/45 backdrop-blur-md shadow-2xl p-4",
  input:
    "w-full text-sm leading-6 rounded-lg outline-none transition shadow " +
    "bg-white placeholder:text-gray-500 border border-gray-300 " +
    "focus:border-[#035ec5] focus:ring-2 focus:ring-[#035ec5]/20 px-3 py-2.5",
  label: "block text-[13px] font-medium leading-6 text-gray-800 mb-1",
  helper: "mt-1 text-xs leading-5 text-gray-500",
  error: "mt-1 text-xs leading-5 text-rose-600",
  chip: "px-3 py-1.5 rounded-full text-xs leading-tight border border-gray-300 shadow-sm whitespace-nowrap transition",
  chipOn: "bg-[#035ec5] text-white border-[#035ec5]",
  chipOff: "bg-white text-gray-800 hover:border-[#035ec5]/70",
  ringError: "ring-2 ring-rose-300",
};

export default function ApplyMentorModal({ open, onClose, onApplied }: Props) {
  const [uid, setUid] = useState("");
  const [loading, setLoading] = useState(false);
  const [alreadyMentor, setAlreadyMentor] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    areasInteres: [] as string[],
    porQueSoyMentor: "",
    comoPuedoAyudar: "",
    acercaDeMi: "",
    idiomas: [] as string[],
    experiencia: "",
    country: "México",
    photoUrl: "",
    hourlyRate: 0,
  });

  // Upload
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  // UX
  const [areaSearch, setAreaSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialFocusRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // open effects
  useEffect(() => {
    if (!open) return;
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (u) => setUid(u?.uid || ""));
    setUid(auth.currentUser?.uid || "");

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => initialFocusRef.current?.focus(), 10);
    return () => { unsub(); document.body.style.overflow = prev; };
  }, [open]);

  // prefill
  useEffect(() => {
    if (!open || !uid) return;
    (async () => {
      try {
        const r = await fetch("/api/mentors/me", { headers: { "x-user-id": uid } });
        const j = await r.json();
        setAlreadyMentor(j.item?.role === "mentor");
        if (j.item?.photoUrl) {
          setPreview(j.item.photoUrl);
          setForm((p) => ({ ...p, photoUrl: j.item.photoUrl }));
        }
        if (j.item?.fullName) setForm((p)=>({...p, fullName: p.fullName || j.item.fullName}));
      } catch {}
    })();
  }, [open, uid]);

  // focus trap + shortcuts
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "enter") submit();
      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (k: keyof typeof form, v: any) => setForm((prev) => ({ ...prev, [k]: v }));

  const toggleArea = (a: string) =>
    setForm((p) => ({
      ...p,
      areasInteres: p.areasInteres.includes(a)
        ? p.areasInteres.filter((x) => x !== a)
        : [...p.areasInteres, a],
    }));

  const toggleIdioma = (i: string) =>
    setForm((p) => ({
      ...p,
      idiomas: p.idiomas.includes(i)
        ? p.idiomas.filter((x) => x !== i)
        : [...p.idiomas, i],
    }));

  const requiredOk = useMemo(() => {
    return !!(
      form.fullName &&
      form.porQueSoyMentor &&
      form.comoPuedoAyudar &&
      form.acercaDeMi &&
      form.experiencia &&
      form.areasInteres.length
    );
  }, [form]);

  // upload to S3
  const handlePickFile = async (e: React.ChangeEvent<HTMLInputElement> | { dataTransfer: DataTransfer }) => {
    const fileList = "target" in e ? (e.target as HTMLInputElement).files : e.dataTransfer.files;
    const file = fileList?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Selecciona una imagen válida.");
      if ("target" in e && fileRef.current) fileRef.current.value = "";
      return;
    }
    const MAX_MB = 5;
    if (file.size > MAX_MB * 1024 * 1024) {
      alert(`La imagen no debe exceder ${MAX_MB} MB.`);
      if ("target" in e && fileRef.current) fileRef.current.value = "";
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setFileName(file.name);

      const presign = await fetch("/api/uploads/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const { uploadUrl, publicUrl, error } = await presign.json();
      if (!presign.ok) throw new Error(error || "No se pudo preparar la subida");

      await putWithProgress(uploadUrl, file, (p) => setProgress(p));

      set("photoUrl", publicUrl);
      setPreview(publicUrl);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error al subir la imagen");
      if (fileRef.current) fileRef.current.value = "";
      setFileName("");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  function putWithProgress(url: string, file: File, onProgress: (percent: number) => void) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.upload.onprogress = (evt: ProgressEvent<EventTarget>) => {
        if (evt.lengthComputable) {
          const pct = Math.round((evt.loaded / evt.total) * 100);
          onProgress(pct);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload failed (${xhr.status})`));
      };
      xhr.onerror = () => reject(new Error("Upload error"));
      xhr.send(file);
    });
  }

  const validate = (): Record<string,string> => {
    const errs: Record<string,string> = {};
    if (!form.fullName.trim()) errs.fullName = "El nombre completo es obligatorio.";
    if (!form.areasInteres.length) errs.areasInteres = "Selecciona al menos un área de experiencia.";
    if (!form.porQueSoyMentor.trim()) errs.porQueSoyMentor = "Completa “¿Por qué soy mentor?”.";
    if (!form.comoPuedoAyudar.trim()) errs.comoPuedoAyudar = "Completa “¿Cómo puedo ayudar?”.";
    if (!form.acercaDeMi.trim()) errs.acercaDeMi = "Completa “Acerca de mí”.";
    if (!form.experiencia.trim()) errs.experiencia = "Indica tu experiencia.";
    if (form.hourlyRate < 0) errs.hourlyRate = "La tarifa no puede ser negativa.";
    return errs;
  };

  const focusFirstError = (errs: Record<string,string>) => {
    const firstKey = Object.keys(errs)[0];
    if (!firstKey) return;
    const el = document.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
    el?.focus();
  };

  const submit = async () => {
    if (!uid) { alert("Inicia sesión."); return; }
    if (uploading) { alert("Espera a que termine la subida de la foto."); return; }

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) { focusFirstError(errs); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/mentors/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      alert("¡Listo! Tu perfil de mentor quedó activo y ya aparece en el listado.");
      onApplied();
      onClose();
    } catch (e: any) {
      alert(e.message || "No se pudo guardar");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const areasFiltradas = AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.trim().toLowerCase())
  );

  const toggleAllAreas = () => {
    if (form.areasInteres.length === AREAS.length) set("areasInteres", []);
    else set("areasInteres", AREAS.slice());
  };
  const toggleAllIdiomas = () => {
    if (form.idiomas.length === IDIOMAS_OPCIONES.length) set("idiomas", []);
    else set("idiomas", IDIOMAS_OPCIONES.slice());
  };
  const onBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-b from-black/60 via-black/40 to-black/60"
      onMouseDown={onBackdropClick}
      aria-modal
      role="dialog"
      aria-label="Crear perfil de mentor"
    >
      <div
        ref={modalRef}
        className="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl outline-none flex flex-col text-gray-900"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/40 bg-white/70 backdrop-blur-xl flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold leading-7">Crear perfil de mentor</h3>
            <p className="text-[13px] leading-6 text-gray-600 mt-1">
              Completa tu perfil. Los campos con <span className="text-rose-600 font-medium">*</span> son obligatorios.
            </p>
          </div>
          <button className="rounded p-1 text-gray-600 hover:text-gray-900" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {/* Body */}
        <form className="overflow-y-auto px-6 pt-5 pb-4" onSubmit={(e)=>{ e.preventDefault(); submit(); }}>
          {alreadyMentor && (
            <div className={`${C.card} mb-5 text-[13px] leading-6 text-emerald-900 bg-emerald-50/80 border-emerald-200`}>
              Ya tienes un perfil activo. Puedes actualizar tus datos y guardar.
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div className={`${C.card} mb-5 text-[13px] leading-6 text-rose-800 bg-rose-50/90 border-rose-200`}>
              Revisa los campos marcados en rojo.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Datos básicos */}
            <section className={`${C.card} space-y-4`}>
              <header className="text-sm font-semibold">Datos básicos</header>

              <div>
                <label className={C.label}>Nombre completo <span className="text-rose-600">*</span></label>
                <input
                  ref={initialFocusRef}
                  data-field="fullName"
                  className={`${C.input} ${errors.fullName ? C.ringError : ""}`}
                  value={form.fullName}
                  onChange={(e)=>{ set("fullName", e.target.value); if (errors.fullName) setErrors((er)=>({ ...er, fullName: "" })); }}
                  placeholder="Ej. Ana López"
                  aria-invalid={!!errors.fullName}
                />
                {errors.fullName && <p className={C.error}>{errors.fullName}</p>}
              </div>

              <div>
                <label className={C.label}>País</label>
                <input
                  className={C.input}
                  value={form.country}
                  onChange={(e)=>set("country", e.target.value)}
                  placeholder="Ej. México"
                />
              </div>

              <div>
                <label className={C.label}>Tarifa por hora (MXN)</label>
                <div className="relative">
                  <input
                    data-field="hourlyRate"
                    type="number"
                    min={0}
                    step={50}
                    className={`${C.input} pr-16 ${errors.hourlyRate ? C.ringError : ""}`}
                    value={form.hourlyRate}
                    onChange={(e)=>{
                      const num = Math.max(0, Number(e.target.value || 0));
                      set("hourlyRate", num);
                      if (errors.hourlyRate) setErrors((er)=>({ ...er, hourlyRate: "" }));
                    }}
                    placeholder="Ej. 600"
                    aria-invalid={!!errors.hourlyRate}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-gray-600">/hora</span>
                </div>
                <p className={C.helper}>Deja 0 si prefieres no mostrar tarifa.</p>
                {errors.hourlyRate && <p className={C.error}>{errors.hourlyRate}</p>}
              </div>
            </section>

            {/* ————— IDENTIDAD (Reacomodada) ————— */}
            <section className={`${C.card} space-y-5`}>
              <header className="text-sm font-semibold">Identidad</header>

              {/* Uploader en layout claro y sin encimar */}
              <div>
                <label className={C.label}>Foto de perfil</label>

                {/* Contenedor */}
                <div
                  className={`rounded-2xl border-2 ${dragOver ? "border-[#035ec5] bg-white" : "border-dashed border-gray-300 bg-gray-50"} transition p-4`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!uid) return; handlePickFile({ dataTransfer: e.dataTransfer }); }}
                >
                  {/* Grid: avatar | acciones */}
                  <div className="grid grid-cols-[88px_1fr] gap-4 items-start">
                    {/* Avatar */}
                    <div className="w-22">
                      <img
                        src={preview || "/avatar-placeholder.png"}
                        alt="preview"
                        className="h-20 w-20 rounded-full object-cover border border-gray-300 bg-white"
                      />
                    </div>

                    {/* Acciones / texto */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex">
                          <span className="sr-only">Seleccionar archivo</span>
                          <input
                            type="file"
                            accept="image/*"
                            ref={fileRef}
                            onChange={handlePickFile}
                            className="block text-sm text-gray-700
                                       file:mr-3 file:py-2 file:px-4
                                       file:rounded-md file:border file:border-gray-300
                                       file:bg-white file:text-gray-800
                                       hover:file:bg-gray-50"
                          />
                        </label>

                        {/* Nombre del archivo (si existe) */}
                        {fileName && (
                          <span className="text-xs text-gray-600 truncate max-w-[260px]" title={fileName}>
                            {fileName}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-2">
                        Arrastra una imagen o haz clic para seleccionar (máx. 5MB).
                      </p>

                      {uploading && (
                        <div className="mt-3">
                          <div className="h-2 bg-gray-200 rounded">
                            <div className="h-2 rounded bg-[#035ec5]" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="text-xs text-gray-600 mt-1">{progress}%</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Idiomas */}
              <div>
                <div className="flex items-center justify-between">
                  <label className={C.label}>Idiomas</label>
                  <button
                    type="button"
                    className="text-xs font-medium text-[#035ec5] hover:underline"
                    onClick={toggleAllIdiomas}
                  >
                    {form.idiomas.length === IDIOMAS_OPCIONES.length ? "Limpiar" : "Seleccionar todo"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {IDIOMAS_OPCIONES.map((i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => toggleIdioma(i)}
                      className={`${C.chip} ${form.idiomas.includes(i) ? C.chipOn : C.chipOff}`}
                      aria-pressed={form.idiomas.includes(i)}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                {form.idiomas.length > 0 && (
                  <div className={C.helper}>Seleccionados: {form.idiomas.length}</div>
                )}
              </div>
            </section>

            {/* Áreas */}
            <section className={`${C.card} space-y-3`}>
              <header className="text-sm font-semibold">Áreas de experiencia <span className="text-rose-600">*</span></header>
              <div className="flex items-center gap-2">
                <input
                  className={`${C.input} !py-2 !text-sm`}
                  placeholder="Filtrar áreas…"
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  aria-label="Filtrar áreas"
                />
                <button type="button" className="text-xs font-medium text-[#035ec5] hover:underline shrink-0" onClick={toggleAllAreas}>
                  {form.areasInteres.length === AREAS.length ? "Limpiar" : "Todo"}
                </button>
              </div>
              <div className={`flex flex-wrap gap-2 mt-1 ${errors.areasInteres ? C.ringError + " rounded-lg p-2" : ""}`}>
                {areasFiltradas.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => { toggleArea(a); if (errors.areasInteres) setErrors((er)=>({ ...er, areasInteres: "" })); }}
                    className={`${C.chip} ${form.areasInteres.includes(a) ? C.chipOn : C.chipOff}`}
                    aria-pressed={form.areasInteres.includes(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className={C.helper}>Seleccionadas: {form.areasInteres.length}</div>
              {errors.areasInteres && <p className={C.error}>{errors.areasInteres}</p>}
            </section>
          </div>

          {/* Textos largos */}
          <section className={`${C.card} space-y-6 mt-6`}>
            <FieldBlock
              name="porQueSoyMentor"
              label="¿Por qué soy mentor?"
              required
              errorMsg={errors.porQueSoyMentor}
              onClearError={()=> setErrors((er)=>({ ...er, porQueSoyMentor: "" }))}
            >
              <Textarea
                value={form.porQueSoyMentor}
                onChange={(v)=>set("porQueSoyMentor", v)}
                max={600}
                placeholder="Ej. Quiero retribuir a la comunidad emprendedora..."
              />
            </FieldBlock>

            <FieldBlock
              name="comoPuedoAyudar"
              label="¿Cómo puedo ayudar?"
              required
              errorMsg={errors.comoPuedoAyudar}
              onClearError={()=> setErrors((er)=>({ ...er, comoPuedoAyudar: "" }))}
            >
              <Textarea
                value={form.comoPuedoAyudar}
                onChange={(v)=>set("comoPuedoAyudar", v)}
                max={600}
                placeholder="Ej. Te acompaño en estrategia comercial, pricing y funnels..."
              />
            </FieldBlock>

            <FieldBlock
              name="acercaDeMi"
              label="Acerca de mí"
              required
              errorMsg={errors.acercaDeMi}
              onClearError={()=> setErrors((er)=>({ ...er, acercaDeMi: "" }))}
            >
              <Textarea
                value={form.acercaDeMi}
                onChange={(v)=>set("acercaDeMi", v)}
                max={1000}
                rows={5}
                placeholder="Resumen breve de trayectoria, logros y enfoque..."
              />
            </FieldBlock>

            <div>
              <label className={C.label}>Mi experiencia (años o resumen) <span className="text-rose-600">*</span></label>
              <input
                data-field="experiencia"
                className={`${C.input} ${errors.experiencia ? C.ringError : ""}`}
                value={form.experiencia}
                onChange={(e)=>{ set("experiencia", e.target.value); if (errors.experiencia) setErrors((er)=>({ ...er, experiencia: "" })); }}
                placeholder="Ej. 8 años liderando equipos comerciales en SaaS B2B"
                aria-invalid={!!errors.experiencia}
              />
              {errors.experiencia && <p className={C.error}>{errors.experiencia}</p>}
            </div>
          </section>
        </form>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-white/40 bg-white/70 backdrop-blur-xl flex items-center justify-between">
          <span className="text-[12px] leading-6 text-gray-600">
            Cmd/Ctrl + Enter para publicar. Puedes actualizar tu perfil cuando quieras.
          </span>
          <div className="flex gap-3">
            <button type="button" className="px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 shadow" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2.5 rounded-lg bg-[#035ec5] text-white hover:brightness-110 disabled:opacity-60 shadow"
              onClick={submit}
              disabled={!uid || !requiredOk || loading || uploading}
              title={!uid ? "Inicia sesión" : !requiredOk ? "Completa los campos obligatorios" : uploading ? "Subiendo imagen..." : ""}
            >
              {loading ? "Guardando..." : "Publicar perfil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

function FieldBlock({
  name, label, required, errorMsg, onClearError, children,
}: {
  name: string; label: string; required?: boolean;
  errorMsg?: string; onClearError?: () => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-800 mb-1">{label} {required && <span className="text-rose-600">*</span>}</label>
      <div className={errorMsg ? "ring-2 ring-rose-300 rounded-lg" : ""} onFocus={onClearError}>
        {children}
      </div>
      {errorMsg && <p className="mt-1 text-xs leading-5 text-rose-600">{errorMsg}</p>}
    </div>
  );
}

function Textarea({
  value,
  onChange,
  max = 600,
  rows = 4,
  placeholder,
}: { value: string; onChange: (v: string)=>void; max?: number; rows?: number; placeholder?: string; }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const used = value?.length || 0;
  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = "auto";
    ref.current.style.lineHeight = "1.5";
    ref.current.style.height = Math.min(ref.current.scrollHeight, 320) + "px";
  }, [value]);
  return (
    <div className="relative">
      <textarea
        ref={ref}
        className={`${C.input} resize-none pr-20`}
        rows={rows}
        maxLength={max}
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        placeholder={placeholder}
      />
      <span className="absolute bottom-1.5 right-2 text-[11px] leading-5 text-gray-600 bg-white/90 px-1.5 rounded">
        {used}/{max}
      </span>
    </div>
  );
}
