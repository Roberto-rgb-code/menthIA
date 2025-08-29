// lib/notifications.ts
import admin from "firebase-admin";

let app: admin.app.App;
if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
} else {
  app = admin.app();
}

const db = admin.firestore(app);

export type MentorNotification = {
  id: string;                // bookingId (o uuid)
  type: "booking_created" | "booking_updated" | "booking_canceled";
  title: string;             // "Nueva reserva"
  message: string;           // Texto breve
  createdAt: number;         // Date.now()
  seen: boolean;             // false por defecto
  meta?: {
    bookingId?: string;
    startISO?: string;
    endISO?: string;
    menteeEmail?: string;
    meetUrl?: string | null;
    timezone?: string;
  };
};

// Emite una notificación para un mentor (uid = mentorId)
export async function pushMentorNotification(mentorId: string, notif: Omit<MentorNotification, "seen">) {
  const docRef = db
    .collection("notifications")
    .doc(mentorId)
    .collection("items")
    .doc(notif.id);

  await docRef.set(
    {
      ...notif,
      seen: false,
    },
    { merge: true }
  );
}

// Marca como leída una notificación
export async function markNotificationSeen(mentorId: string, notifId: string) {
  const docRef = db
    .collection("notifications")
    .doc(mentorId)
    .collection("items")
    .doc(notifId);
  await docRef.set({ seen: true }, { merge: true });
}
