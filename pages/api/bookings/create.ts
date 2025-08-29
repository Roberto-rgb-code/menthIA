// pages/api/bookings/create.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_NOTIFS, TABLE_BOOKINGS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";
import { createMeetEvent } from "../../../lib/google-calendar";

type MeetResult = {
  eventId: string | null;
  htmlLink: string | null;
  meetLink: string | null;
};

async function pushNotif({
  userId,
  type,
  title,
  body,
  meta = {},
}: {
  userId: string;
  type: string;
  title: string;
  body: string;
  meta?: any;
}) {
  const now = new Date().toISOString();
  try {
    await ddb.send(
      new PutCommand({
        TableName: TABLE_NOTIFS,
        Item: {
          // Si vas a consultar por usuario, considera un GSI (byUserIdCreatedAt)
          id: `${userId}#${now}`, // PK recomendada para tabla sin partición por user
          userId,
          createdAt: now, // útil para GSI sort
          type,
          title,
          body,
          meta,
          read: false,
        },
      })
    );
  } catch (e: any) {
    if (e?.name === "ResourceNotFoundException") {
      console.warn("[notifications] Tabla no encontrada:", TABLE_NOTIFS, " — se omite la notificación.");
      return; // “soft-fail”: no rompemos el flujo de reservas
    }
    console.error("[notifications] Error guardando notificación:", e);
    // también lo dejamos pasar para no cortar la reserva
  }
}

function fmtRange(startISO: string, endISO: string, tz: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const optsDate: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: tz,
  };
  const optsTime: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: tz,
  };
  const d = s.toLocaleDateString("es-MX", optsDate);
  const hs = s.toLocaleTimeString([], optsTime);
  const he = e.toLocaleTimeString([], optsTime);
  return `${d} ${hs}–${he} (${tz})`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const menteeId = requireUserId(req, res); // usuario que reserva
  if (!menteeId) return;

  try {
    const {
      mentorId,
      menteeEmail,
      mentorEmail,
      startISO,
      endISO,
      notes,
      timezone: tzClient,
    } = req.body || {};

    if (!mentorId || !menteeEmail || !startISO || !endISO) {
      return res.status(400).json({
        error: "Faltan campos: mentorId, menteeEmail, startISO, endISO",
      });
    }

    const timezone =
      tzClient || Intl.DateTimeFormat().resolvedOptions().timeZone;

    // 1) Intentar crear evento en Calendar (no romper si el mentor no lo conectó)
    let meet: MeetResult = { eventId: null, htmlLink: null, meetLink: null };
    try {
      const created = await createMeetEvent({
        mentorUserId: mentorId,
        attendeeEmail: menteeEmail,
        mentorEmail,
        startISO,
        endISO,
        summary: "Sesión de Mentoría - MentorApp",
        description: notes || "",
        timezone,
      });
      meet = {
        eventId: created.eventId || null,
        htmlLink: created.htmlLink || null,
        meetLink: created.meetLink || null,
      };
    } catch (err: any) {
      if (err?.code === "mentor_calendar_not_connected") {
        console.warn("Mentor sin Calendar conectado. Continuando sin Meet.");
      } else {
        console.error("createMeetEvent error", err);
        // seguimos y guardamos la reserva sin Meet
      }
    }

    // 2) Guardar booking en DynamoDB
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const item = {
      bookingId,          // PK de la tabla Bookings
      mentorId,           // útil para un GSI por mentor
      menteeId,           // útil para un GSI por mentee
      menteeEmail,
      mentorEmail: mentorEmail || null,
      startISO,
      endISO,
      timezone,
      notes: notes || "",
      meetUrl: meet.meetLink,
      calendarEventId: meet.eventId,
      calendarHtmlLink: meet.htmlLink,
      createdAt: new Date().toISOString(),
      status: "confirmed",
    };

    await ddb.send(new PutCommand({ TableName: TABLE_BOOKINGS, Item: item }));

    // 3) Notificaciones (mentor y mentee) — soft-fail si la tabla no existe
    const rangeText = fmtRange(startISO, endISO, timezone);

    await pushNotif({
      userId: mentorId,
      type: "booking_created",
      title: "Nueva reserva",
      body: `Tienes una nueva reserva para el ${rangeText}.`,
      meta: {
        bookingId,
        startISO,
        endISO,
        timezone,
        menteeEmail,
        meetLink: meet.meetLink,
        calendarHtmlLink: meet.htmlLink,
      },
    });

    await pushNotif({
      userId: menteeId,
      type: "booking_confirmed",
      title: "Reserva confirmada",
      body: `Tu reserva fue confirmada para el ${rangeText}.`,
      meta: {
        bookingId,
        startISO,
        endISO,
        timezone,
        mentorId,
        mentorEmail: mentorEmail || null,
        meetLink: meet.meetLink,
        calendarHtmlLink: meet.htmlLink,
      },
    });

    // 4) Respuesta
    return res.status(200).json({
      ok: true,
      bookingId,
      meetUrl: item.meetUrl,
      calendarHtmlLink: item.calendarHtmlLink,
      message: item.meetUrl
        ? "¡Reserva creada! Evento creado en Calendar."
        : "Reserva creada. El mentor no tiene Calendar conectado (sin link de Meet).",
    });
  } catch (e: any) {
    console.error("booking create error", e);
    // Si la tabla Bookings no existe, este catch la capturará igual.
    return res.status(500).json({ error: e.message || "Server error" });
  }
}
