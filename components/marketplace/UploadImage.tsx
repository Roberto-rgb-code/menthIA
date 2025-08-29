// components/marketplace/UploadImage.tsx
import { useRef, useState } from "react";

function extFromMime(m: string): string {
  if (m === "image/jpeg") return "jpg";
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  if (m === "image/gif") return "gif";
  return "";
}

export default function UploadImage({
  pathHint,             // p.ej. "providers/<providerId>/logo"
  label = "Subir imagen",
  accept = "image/*",
  maxSizeMB = 8,
  onUploaded,
  help,
}: {
  pathHint: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  onUploaded: (publicUrl: string) => void;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  const pick = () => inputRef.current?.click();

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones UX
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      alert(`La imagen supera ${maxSizeMB}MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("El archivo debe ser una imagen.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      // Asegurar extensión
      let ext = (file.name.split(".").pop() || "").toLowerCase();
      if (!ext) ext = extFromMime(file.type) || "jpg";
      const keyWithExt = `${pathHint}.${ext}`;

      const r = await fetch("/api/marketplace/upload-signed-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": (window as any)._uid || "" },
        body: JSON.stringify({ pathHint: keyWithExt, contentType: file.type }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo firmar URL");

      // PUT directo a S3
      await fetch(j.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      onUploaded(j.publicUrl);
    } catch (e: any) {
      alert(e.message || "Error subiendo imagen");
      setPreview("");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChange} />
      <button
        type="button"
        onClick={pick}
        disabled={loading}
        className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 disabled:opacity-60 text-sm"
      >
        {loading ? "Subiendo…" : label}
      </button>
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="h-10 w-10 rounded object-cover border"
        />
      )}
      {help && <span className="text-xs text-gray-500">{help}</span>}
    </div>
  );
}
