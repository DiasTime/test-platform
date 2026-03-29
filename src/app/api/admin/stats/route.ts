import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const [questionsSnapshot, usersSnapshot, testsSnapshot] = await Promise.all([
      adminDb.collection("questions").count().get(),
      adminDb.collection("users").count().get(),
      adminDb.collection("tests").count().get(),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalQuestions: questionsSnapshot.data().count,
        totalUsers: usersSnapshot.data().count,
        totalTests: testsSnapshot.data().count,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, error: "Ошибка получения статистики" }, { status: 500 });
  }
}
