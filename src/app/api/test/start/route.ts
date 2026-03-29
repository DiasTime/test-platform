import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

const QUESTIONS_PER_TEST = 20;

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Не авторизован" }, { status: 401 });
    }

    const activeTest = await adminDb
      .collection("tests")
      .where("userId", "==", session.id)
      .where("status", "==", "in_progress")
      .limit(1)
      .get();

    if (!activeTest.empty) {
      const existingTest = activeTest.docs[0];
      const testData = existingTest.data();
      
      await adminRealtimeDb.ref(`activeTests/${existingTest.id}`).set({
        userId: session.id,
        userEmail: session.email,
        userName: `${session.firstName} ${session.lastName}`,
        startedAt: testData.startedAt?.toMillis?.() || Date.now(),
        answeredCount: Object.keys(testData.answers || {}).length,
        totalQuestions: testData.totalQuestions || QUESTIONS_PER_TEST,
        status: "in_progress",
      });
      
      return NextResponse.json({
        success: true,
        testId: existingTest.id,
        questions: testData.questions,
        resuming: true,
      });
    }

    const questionsSnapshot = await adminDb.collection("questions").get();
    const allQuestions = questionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text as string,
        options: data.options as string[],
        correctAnswer: data.correctAnswer as number,
      };
    });

    if (allQuestions.length < QUESTIONS_PER_TEST) {
      return NextResponse.json(
        { success: false, error: `Недостаточно вопросов в базе. Нужно минимум ${QUESTIONS_PER_TEST}` },
        { status: 400 }
      );
    }

    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, QUESTIONS_PER_TEST);

    const testQuestions = selectedQuestions.map((q) => ({
      questionId: q.id,
      text: q.text,
      options: q.options,
    }));

    const testRef = await adminDb.collection("tests").add({
      userId: session.id,
      userEmail: session.email,
      userName: `${session.firstName} ${session.lastName}`,
      questions: testQuestions,
      answers: {},
      totalQuestions: QUESTIONS_PER_TEST,
      startedAt: new Date(),
      status: "in_progress",
    });

    await adminRealtimeDb.ref(`activeTests/${testRef.id}`).set({
      userId: session.id,
      userEmail: session.email,
      userName: `${session.firstName} ${session.lastName}`,
      startedAt: Date.now(),
      answeredCount: 0,
      totalQuestions: QUESTIONS_PER_TEST,
      status: "in_progress",
    });

    return NextResponse.json({
      success: true,
      testId: testRef.id,
      questions: testQuestions,
      resuming: false,
    });
  } catch (error) {
    console.error("Start test error:", error);
    return NextResponse.json({ success: false, error: "Ошибка при создании теста" }, { status: 500 });
  }
}
