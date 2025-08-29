// pages/api/bookings/cancel.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddb, TABLE_BOOKINGS, TABLE_AVAIL, TABLE_NOTIFS } from "../../../lib/dynamodb";
import { requireUserId } from "../util/getUserId";
import { deleteCalendarEvent } from "../../../lib/google-calendar";

async function pushNotif(userId: string, type: string, title: string, body: string, meta: any = {}) {
  const now = new Date().toISOString();
  try {
    await ddb.send(new PutCommand({
      TableName: TABLE_NOTIFS,
      Item: { id: `${userId}#${now}`, userId, createdAt: now, type, title, body, meta, read: false },
    }));
  } catch (e) {
    console.warn("[notifications] omitida:", e?.message || e);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const requesterId = requireUserId(req, res);
    if (!requesterId) return;

    const { bookingId, oauthTokens, impersonatedUserEmail } = req.body || {};
    if (!bookingId) return res.status(400).json({ error: "bookingId requerido" });

    const b = await ddb.send(new GetCommand({ TableName: TABLE_BOOKINGS, Key: { bookingId } }));
    if (!b.Item) return res.status(404).json({ error: "Booking no encontrado" });

    const { mentorId, menteeId, startISO, endISO, timezone, calendarEventId } = b.Item as any;

    if (requesterId !== mentorId && requesterId !== menteeId) {
      return res.status(403).json({ error: "No autorizado a cancelar esta cita" });
    }

    // 1) Borra evento de Calendar (si existe)
    try {
      if (calendarEventId) {
        await deleteCalendarEvent(calendarEventId, { oauthTokens, impersonatedUserEmail });
      }
    } catch (e) {
      console.warn("No se pudo borrar el evento de Calendar:", e);
    }

    // 2) Marcar el slot como libre en disponibilidad del mentor
    const date = startISO.slice(0, 10); // YYYY-MM-DD
    const avail = await ddb.send(new GetCommand({ TableName: TABLE_AVAIL, Key: { userId: mentorId, date } }));
    const prevSlots: Array<{startISO:string;endISO:string;booked?:boolean}> = Array.isArray(avail.Item?.slots) ? avail.Item!.slots : [];

    const updatedSlots = prevSlots.map(s => {
      if (s.startISO === startISO && s.endISO === endISO) return { ...s, booked: false };
      return s;
    });

    await ddb.send(new UpdateCommand({
      TableName: TABLE_AVAIL,
      Key: { userId: mentorId, date },
      UpdateExpression: "SET slots = :s, updatedAt = :u",
      ExpressionAttributeValues: { ":s": updatedSlots, ":u": new Date().toISOString() },
    }));

    // 3) Marcar booking cancelado
    await ddb.send(new UpdateCommand({
      TableName: TABLE_BOOKINGS,
      Key: { bookingId },
      UpdateExpression: "SET #st = :c",
      ExpressionAttributeNames: { "#st": "status" },
      ExpressionAttributeValues: { ":c": "cancelled" },
    }));

    // 4) Notifica a ambos
    const rangeText = (() => {
      try {
        const s = new Date(startISO).toLocaleString("es-MX", { dateStyle: "long", timeStyle: "short", timeZone: timezone });
        const e = new Date(endISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: timezone });
        return `${s} – ${e} (${timezone})`;
      } catch { return `${startISO} - ${endISO}`; }
    })();

    await Promise.all([
      pushNotif(mentorId, "booking_cancelled", "Reserva cancelada", `Se canceló la reserva del ${rangeText}.`, { bookingId, startISO, endISO }),
      pushNotif(menteeId, "booking_cancelled", "Tu reserva fue cancelada", `Se canceló la reserva del ${rangeText}.`, { bookingId, startISO, endISO }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("booking cancel error", e);
    return res.status(500).json({ error: "Server error" });
  }
}
