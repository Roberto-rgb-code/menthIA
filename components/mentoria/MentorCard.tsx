import React from "react";

type Mentor = {
  fullName?: string;
  photoUrl?: string;
  country?: string;
  areasInteres?: string[];
  hourlyRate?: number;
  rating?: number;
  sessionsCount?: number;
  [k: string]: any;
};

export default function MentorCard({
  mentor,
  onOpenProfile,
}: {
  mentor: Mentor;
  onOpenProfile: (m: Mentor) => void;
}) {
  const {
    fullName = "Mentor",
    photoUrl,
    country,
    areasInteres = [],
    hourlyRate = 0,
    rating = 0,
    sessionsCount = 0,
  } = mentor || {};

  const areasToShow = areasInteres.slice(0, 5);
  const extraAreas = Math.max(0, areasInteres.length - areasToShow.length);

  const onActivate: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpenProfile(mentor);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpenProfile(mentor)}
      onKeyDown={onActivate}
      className="relative flex w-full flex-col rounded-xl bg-white text-slate-700 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
    >
      {/* Header compacto con gradiente + avatar reducido */}
      <div className="relative mx-3 -mt-5 h-24 overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/30">
        <div className="absolute left-3 -bottom-6 h-12 w-12 rounded-full border-3 border-white bg-white shadow-sm overflow-hidden">
          <img
            src={photoUrl || "/avatar-placeholder.png"}
            alt={fullName}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/avatar-placeholder.png";
            }}
          />
        </div>
      </div>

      {/* Contenido compacto */}
      <div className="p-4 pt-8">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-snug text-slate-900 truncate">
            {fullName}
          </h3>
          {hourlyRate ? (
            <span className="ml-2 shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              ${hourlyRate}/h
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 text-xs text-slate-600 truncate">
          {country ? <span>{country}</span> : <span className="text-slate-400">—</span>}
        </div>

        <div className="mt-1 text-xs text-slate-700">
          <span>⭐ {rating || 0}</span>
          <span className="mx-1 text-slate-400">·</span>
          <span>{sessionsCount || 0} sesiones</span>
        </div>

        {/* Chips (compactos) */}
        {areasToShow.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {areasToShow.map((a) => (
              <span
                key={a}
                className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700"
              >
                {a}
              </span>
            ))}
            {extraAreas > 0 && (
              <span className="text-[11px] text-slate-500">+{extraAreas}</span>
            )}
          </div>
        )}
      </div>

      {/* Footer/CTA compacto */}
      <div className="p-4 pt-0">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOpenProfile(mentor);
          }}
          className="inline-flex select-none cursor-pointer items-center justify-center rounded-md bg-blue-500 px-4 py-1.5 text-center text-[11px] font-bold uppercase text-white shadow-sm shadow-blue-500/20 transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Ver perfil
        </div>
      </div>
    </div>
  );
}
