import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminRealtimeDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { testId, currentQuestionIndex, totalQuestions } = body;

    if (!testId) {
      return NextResponse.json({ success: false, error: "testId обязателен" }, { status: 400 });
    }

    await adminRealtimeDb.ref(`activeTests/${testId}`).update({
      lastActivity: Date.now(),
      currentQuestionIndex: currentQuestionIndex ?? 0,
      isOnline: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Heartbeat error:", error);
    return NextResponse.json({ success: false, error: "Ошибка heartbeat" }, { status: 500 });
  }
}
