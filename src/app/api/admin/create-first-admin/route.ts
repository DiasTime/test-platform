import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const adminSecret = request.headers.get("x-admin-secret");
    if (adminSecret !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ success: false, error: "Неверный секретный ключ" }, { status: 403 });
    }

    const body = await request.json();
    const { email, iin, firstName, lastName } = body;

    const existingAdmins = await adminDb
      .collection("users")
      .where("role", "==", "admin")
      .limit(1)
      .get();

    if (!existingAdmins.empty) {
      return NextResponse.json(
        { success: false, error: "Админ уже существует" },
        { status: 400 }
      );
    }

    const docRef = await adminDb.collection("users").add({
      email,
      iin,
      firstName,
      lastName,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Админ успешно создан",
      adminId: docRef.id,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка создания админа" },
      { status: 500 }
    );
  }
}
