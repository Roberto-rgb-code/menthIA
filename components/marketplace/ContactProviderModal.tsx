import { useState } from "react";
import { ContactPayload } from "../../types/marketplace";

export default function ContactProviderModal({
  open, onClose, providerId, serviceId
}:{
  open: boolean; onClose: ()=>void; providerId: string; serviceId?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!name || !email || !message) return alert("Completa tu nombre, email y mensaje.");
    setSending(true);
    try {
      const payload: ContactPayload = { providerId, serviceId, name, email, message };
      const r = await fetch("/api/marketplace/contacts", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("No se pudo enviar");
      setDone(true);
    } catch (e:any) {
      alert(e.message || "Error al enviar");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Contactar proveedor</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        {!done ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-600">Nombre</label>
                <input className="w-full border rounded-lg px-3 py-2" value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-gray-600">Correo</label>
                <input type="email" className="w-full border rounded-lg px-3 py-2" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-sm text-gray-600">Mensaje</label>
              <textarea className="w-full border rounded-lg px-3 py-2 min-h-[120px]"
                placeholder="¿Qué necesitas? Contexto, metas, tiempos…"
                value={message} onChange={(e)=>setMessage(e.target.value)} />
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancelar</button>
              <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                onClick={submit} disabled={sending}>
                {sending? "Enviando…":"Enviar"}
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="text-lg font-semibold">¡Mensaje enviado!</div>
            <div className="text-gray-600 text-sm mt-1">El proveedor recibirá tu solicitud y podrá responderte por correo.</div>
            <button className="mt-6 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700" onClick={onClose}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
