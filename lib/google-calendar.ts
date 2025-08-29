// lib/google-calendar.ts
import { google } from "googleapis";
import { v4 as uuid } from "uuid";
import { ddb, TABLE_GOOGLE_TOKENS } from "./dynamodb";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { OAuth2Client } from "google-auth-library";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET as string;
const REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI as string;
const SCOPES = (process.env.GOOGLE_CALENDAR_SCOPES || "")
  .split(/\s+/)
  .filter(Boolean);

function newOAuth2(): OAuth2Client {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

export function buildAuthUrl(userId: string) {
  const oauth2 = newOAuth2();
  return oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state: userId, // volvemos con este userId
  });
}

export async function exchangeCodeAndStoreTokens(code: string, userId: string) {
  const oauth2 = newOAuth2();
  const { tokens } = await oauth2.getToken(code);

  await ddb.send(
    new PutCommand({
      TableName: TABLE_GOOGLE_TOKENS,
      Item: {
        userId,
        tokens,
        updatedAt: Date.now(),
      },
    })
  );

  return tokens;
}

function isResourceNotFound(err: any) {
  const s = String(err?.name || err?.__type || err?.message || "");
  return (
    s.includes("ResourceNotFoundException") ||
    s.includes("Requested resource not found")
  );
}

type GetOAuthResult =
  | { connected: false }
  | { connected: true; oauth2: OAuth2Client; calendar: ReturnType<typeof google.calendar> };

export async function getOAuthForUser(userId: string): Promise<GetOAuthResult> {
  try {
    const g = await ddb.send(
      new GetCommand({ TableName: TABLE_GOOGLE_TOKENS, Key: { userId } })
    );
    const tokens = (g as any)?.Item?.tokens;
    if (!tokens) return { connected: false };

    const oauth2 = newOAuth2();
    oauth2.setCredentials(tokens);

    // Si Google refresca, persistimos
    oauth2.on("tokens", async (tk) => {
      try {
        const merged = { ...tokens, ...tk };
        await ddb.send(
          new PutCommand({
            TableName: TABLE_GOOGLE_TOKENS,
            Item: { userId, tokens: merged, updatedAt: Date.now() },
          })
        );
      } catch (e) {
        console.warn("[google-calendar] No se pudo persistir refresh tokens:", e);
      }
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2 });
    return { connected: true, oauth2, calendar };
  } catch (err) {
    if (isResourceNotFound(err)) {
      console.warn(
        "[google-calendar] Tabla de tokens no encontrada; continuamos sin Google."
      );
      return { connected: false };
    }
    console.error("[google-calendar] getOAuthForUser error:", err);
    return { connected: false };
  }
}

export type CreateMeetEventResult = {
  ok: boolean;
  eventId: string | null;
  htmlLink: string | null;
  meetLink: string | null;
  reason?: "not_connected" | "google_error";
};

/**
 * Crea un evento de Calendar con link de Google Meet SI el mentor está conectado.
 * Si no lo está, NO lanza error: retorna { ok:true, meetLink:null } para que la reserva prosiga.
 */
export async function createMeetEvent({
  mentorUserId,
  attendeeEmail,
  mentorEmail, // opcional, solo para attendees
  startISO,
  endISO,
  summary,
  description,
  timezone = "America/Mexico_City",
}: {
  mentorUserId: string;
  attendeeEmail: string;
  mentorEmail?: string;
  startISO: string; // "2025-08-14T18:00:00"
  endISO: string;   // "2025-08-14T18:30:00"
  summary: string;
  description?: string;
  timezone?: string;
}): Promise<CreateMeetEventResult> {
  const got = await getOAuthForUser(mentorUserId);
  if (!got.connected) {
    return {
      ok: true,
      eventId: null,
      htmlLink: null,
      meetLink: null,
      reason: "not_connected",
    };
  }

  const { calendar } = got;
  const requestId = uuid();

  try {
    const event = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary,
        description: description || "",
        start: { dateTime: startISO, timeZone: timezone },
        end: { dateTime: endISO, timeZone: timezone },
        attendees: [
          { email: attendeeEmail },
          ...(mentorEmail ? [{ email: mentorEmail }] : []),
        ],
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    const data = event.data;
    const meetLink =
      data.hangoutLink ||
      data.conferenceData?.entryPoints?.find((p) => p.entryPointType === "video")
        ?.uri ||
      null;

    return {
      ok: true,
      eventId: data.id ?? null,
      htmlLink: data.htmlLink ?? null,
      meetLink,
    };
  } catch (err) {
    console.error("[google-calendar] createMeetEvent error:", err);
    // No interrumpimos la reserva por fallos de Google
    return {
      ok: true,
      eventId: null,
      htmlLink: null,
      meetLink: null,
      reason: "google_error",
    };
  }
}
