// pages/api/util/firebase-admin-init.ts
import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";

function normalizePath(p?: string) {
  return (p || "").replace(/\\/g, "/");
}

if (!admin.apps.length) {
  const explicit =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "mentorapp-87d09-firebase-adminsdk-fbsvc-5e15d74c53.json";

  const abs = path.isAbsolute(explicit) ? normalizePath(explicit) : path.join(process.cwd(), normalizePath(explicit));

  const jsonStr = fs.readFileSync(abs, "utf8");
  const svc = JSON.parse(jsonStr);
  if (svc.private_key && typeof svc.private_key === "string") {
    svc.private_key = svc.private_key.replace(/\\n/g, "\n");
  }

  admin.initializeApp({
    credential: admin.credential.cert(svc as admin.ServiceAccount),
  });
  console.info("[firebase-admin-init] inicializado con service account JSON:", abs);
}

export const adminAuth = admin.auth();
