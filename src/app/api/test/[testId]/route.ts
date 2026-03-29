import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Не авторизован" }, { status: 401 });
    }

    const { testId } = await params;
    const testDoc = await adminDb.collection("tests").doc(testId).get();

    if (!testDoc.exists) {
      return NextResponse.json({ success: false, error: "Тест не найден" }, { status: 404 });
    }

    const testData = testDoc.data()!;

    if (testData.userId !== session.id && session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      answers: testData.answers || {},
      status: testData.status,
    });
  } catch (error) {
    console.error("Get test error:", error);
    return NextResponse.json({ success: false, error: "Ошибка получения теста" }, { status: 500 });
  }
}
