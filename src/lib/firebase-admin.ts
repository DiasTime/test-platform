import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getDatabase } from "firebase-admin/database";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      })
    : getApps()[0];

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminRealtimeDb = getDatabase(app);

// Firestore surfaces the free-tier daily quota being hit as gRPC code 8
// ("8 RESOURCE EXHAUSTED: Quota exceeded"). Routes use this to respond with a
// meaningful 503 instead of a generic 500.
export function isQuotaExceededError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const { code, message } = error as { code?: unknown; message?: unknown };
  return (
    code === 8 ||
    code === "resource-exhausted" ||
    (typeof message === "string" && /RESOURCE.?EXHAUSTED|Quota exceeded/i.test(message))
  );
}

export default app;
