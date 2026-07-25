import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, adminRealtimeDb, isQuotaExceededError } from "@/lib/firebase-admin";
import { answerSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Не авторизован" }, { status: 401 });
    }

    const body = await request.json();
    const { testId, questionId, answer } = answerSchema.parse(body);

    const testRef = adminDb.collection("tests").doc(testId);
    const testDoc = await testRef.get();

    if (!testDoc.exists) {
      return NextResponse.json({ success: false, error: "Тест не найден" }, { status: 404 });
    }

    const testData = testDoc.data()!;

    if (testData.userId !== session.id) {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    if (testData.status !== "in_progress") {
      return NextResponse.json({ success: false, error: "Тест уже завершен" }, { status: 400 });
    }

    const answers = { ...testData.answers, [questionId]: answer };
    await testRef.update({ answers });

    await adminRealtimeDb.ref(`activeTests/${testId}`).update({
      answeredCount: Object.keys(answers).length,
      lastAnswerAt: Date.now(),
      lastAnsweredQuestion: questionId,
    });

    return NextResponse.json({ success: true, answeredCount: Object.keys(answers).length });
  } catch (error) {
    console.error("Answer error:", error);
    if (isQuotaExceededError(error)) {
      return NextResponse.json(
        { success: false, error: "База данных перегружена: превышена дневная квота. Попробуйте позже." },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: false, error: "Ошибка при сохранении ответа" }, { status: 500 });
  }
}
