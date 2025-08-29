import React, { useState } from "react";
import { getAuth } from "firebase/auth";

export default function MessageModal({
  open,
  onClose,
  mentorId,
}: {
  open: boolean;
  onClose: () => void;
  mentorId: string;
}) {
  const auth = getAuth();
  const uid = auth.currentUser?.uid || "";
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const send = async () => {
    if (!uid) return alert("Inicia sesión.");
    if (!text.trim()) return;
    setSending(true);
    try {
      const r = await fetch("/api/messages/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": uid },
        body: JSON.stringify({ toUserId: mentorId, body: text }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "No se pudo enviar el mensaje");
      setText("");
      alert("Mensaje enviado. Te avisaremos cuando el mentor responda.");
      onClose();
    } catch (e:any) {
      alert(e.message || "Error enviando mensaje");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onMouseDown={(e)=> e.target===e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">Contactar mentor</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Envía un mensaje breve con tu contexto u objetivo.</p>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm mt-3"
          rows={5}
          maxLength={1000}
          placeholder="Hola, me gustaría confirmar que..."
          value={text}
          onChange={(e)=>setText(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Cerrar</button>
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-60"
            onClick={send}
            disabled={!text.trim() || sending}
          >
            {sending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
