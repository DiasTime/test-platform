import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { adminDb } from "./firebase-admin";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

export interface SessionUser {
  id: string;
  email: string;
  iin: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
}

export async function createSession(user: SessionUser): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    iin: user.iin,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);

  return token;
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function findOrCreateUser(data: {
  email: string;
  iin: string;
  firstName: string;
  lastName: string;
}): Promise<SessionUser> {
  const usersRef = adminDb.collection("users");
  const snapshot = await usersRef
    .where("email", "==", data.email)
    .where("iin", "==", data.iin)
    .limit(1)
    .get();

  if (!snapshot.empty) {
    const doc = snapshot.docs[0];
    const userData = doc.data();
    return {
      id: doc.id,
      email: userData.email,
      iin: userData.iin,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || "user",
    };
  }

  const existingByEmail = await usersRef.where("email", "==", data.email).limit(1).get();
  if (!existingByEmail.empty) {
    throw new Error("Пользователь с таким email уже существует с другим ИИН");
  }

  const existingByIin = await usersRef.where("iin", "==", data.iin).limit(1).get();
  if (!existingByIin.empty) {
    throw new Error("Пользователь с таким ИИН уже существует с другим email");
  }

  const newUserRef = await usersRef.add({
    email: data.email,
    iin: data.iin,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    id: newUserRef.id,
    email: data.email,
    iin: data.iin,
    firstName: data.firstName,
    lastName: data.lastName,
    role: "user",
  };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const userDoc = await adminDb.collection("users").doc(userId).get();
  return userDoc.exists && userDoc.data()?.role === "admin";
}
