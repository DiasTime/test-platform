import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, adminRealtimeDb, isQuotaExceededError } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Не авторизован" }, { status: 401 });
    }

    const { testId } = await request.json();

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

    let correctCount = 0;
    const answers = testData.answers || {};

    for (const question of testData.questions) {
      const questionDoc = await adminDb.collection("questions").doc(question.questionId).get();
      if (questionDoc.exists) {
        const correctAnswer = questionDoc.data()!.correctAnswer;
        if (answers[question.questionId] === correctAnswer) {
          correctCount++;
        }
      }
    }

    const score = correctCount;
    const percentage = Math.round((correctCount / testData.totalQuestions) * 100);
    const completedAt = new Date();

    await testRef.update({
      score,
      percentage,
      completedAt,
      status: "completed",
    });

    await adminRealtimeDb.ref(`activeTests/${testId}`).remove();

    await adminRealtimeDb.ref(`completedTests/${testId}`).set({
      userId: session.id,
      userEmail: session.email,
      userName: `${session.firstName} ${session.lastName}`,
      score,
      totalQuestions: testData.totalQuestions,
      percentage,
      completedAt: Date.now(),
    });

    return NextResponse.json({
      success: true,
      score,
      totalQuestions: testData.totalQuestions,
      percentage,
    });
  } catch (error) {
    console.error("Submit test error:", error);
    if (isQuotaExceededError(error)) {
      return NextResponse.json(
        { success: false, error: "База данных перегружена: превышена дневная квота. Попробуйте позже." },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: false, error: "Ошибка при завершении теста" }, { status: 500 });
  }
}
