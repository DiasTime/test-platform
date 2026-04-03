import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId обязателен" }, { status: 400 });
    }

    const testsSnapshot = await adminDb
      .collection("tests")
      .where("userId", "==", userId)
      .get();

    const batch = adminDb.batch();
    const testIds: string[] = [];

    testsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      testIds.push(doc.id);
    });

    await batch.commit();

    for (const testId of testIds) {
      await adminRealtimeDb.ref(`activeTests/${testId}`).remove();
      await adminRealtimeDb.ref(`completedTests/${testId}`).remove();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Удалено ${testsSnapshot.size} тестов. Пользователь может пройти тест заново.` 
    });
  } catch (error) {
    console.error("Reset test error:", error);
    return NextResponse.json({ success: false, error: "Ошибка сброса теста" }, { status: 500 });
  }
}
