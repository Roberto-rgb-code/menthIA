// components/marketplace/DeleteServiceButton.tsx
import React, { useState } from "react";
import { getAuth } from "firebase/auth";

type Props = {
  serviceId: string;
  providerId?: string;
  onDeleted?: () => void;
  className?: string;
  children?: React.ReactNode;
};

const DeleteServiceButton: React.FC<Props> = ({ serviceId, providerId, onDeleted, className, children }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!serviceId) return;
    const ok = confirm("¿Seguro que deseas borrar este servicio? Esta acción no se puede deshacer.");
    if (!ok) return;

    try {
      setLoading(true);
      const uid = getAuth().currentUser?.uid || "";
      const url = providerId
        ? `/api/marketplace/services/${encodeURIComponent(providerId)}/${encodeURIComponent(serviceId)}`
        : `/api/marketplace/services/${encodeURIComponent(serviceId)}`;

      const r = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(uid ? { "x-user-id": uid } : {}),
        },
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "No se pudo eliminar el servicio.");

      onDeleted?.();
      alert("Servicio eliminado.");
    } catch (e: any) {
      alert(e?.message || "Error eliminando servicio.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={
        className ??
        "px-3 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
      }
      title="Eliminar servicio"
    >
      {loading ? "Eliminando…" : (children ?? "Eliminar")}
    </button>
  );
};

export default DeleteServiceButton;
