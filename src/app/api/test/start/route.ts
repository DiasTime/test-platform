import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

const DEFAULT_QUESTIONS = 20;
const MIN_QUESTIONS = 5;

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Не авторизован" }, { status: 401 });
    }

    // Check user's test time window
    const userDoc = await adminDb.collection("users").doc(session.id).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const now = new Date();
      
      const testWindowStart = userData?.testWindowStart?.toDate?.();
      const testWindowEnd = userData?.testWindowEnd?.toDate?.();
      
      if (testWindowStart && now < testWindowStart) {
        const startFormatted = testWindowStart.toLocaleString("ru-RU");
        return NextResponse.json({ 
          success: false, 
          error: `Тестирование откроется ${startFormatted}`,
          errorCode: "NOT_STARTED"
        }, { status: 403 });
      }
      
      if (testWindowEnd && now > testWindowEnd) {
        return NextResponse.json({ 
          success: false, 
          error: "Время для прохождения теста истекло",
          errorCode: "EXPIRED"
        }, { status: 403 });
      }
      
      if (!testWindowStart && !testWindowEnd) {
        return NextResponse.json({ 
          success: false, 
          error: "Вам ещё не назначено время для прохождения теста. Обратитесь к администратору.",
          errorCode: "NO_TIME_ASSIGNED"
        }, { status: 403 });
      }
    }

    // Get question count from admin settings
    const settingsSnapshot = await adminRealtimeDb.ref("settings/questionCount").once("value");
    let questionCount = settingsSnapshot.val() || DEFAULT_QUESTIONS;
    questionCount = Math.max(MIN_QUESTIONS, questionCount);

    // Check if user already completed a test
    const completedTest = await adminDb
      .collection("tests")
      .where("userId", "==", session.id)
      .where("status", "==", "completed")
      .limit(1)
      .get();

    if (!completedTest.empty) {
      return NextResponse.json({ 
        success: false, 
        error: "Вы уже прошли тестирование. Повторное прохождение невозможно.",
        errorCode: "ALREADY_COMPLETED"
      }, { status: 403 });
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
        totalQuestions: testData.totalQuestions || DEFAULT_QUESTIONS,
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

    const actualQuestionCount = Math.min(questionCount, allQuestions.length);

    if (allQuestions.length < MIN_QUESTIONS) {
      return NextResponse.json(
        { success: false, error: `Недостаточно вопросов в базе. Нужно минимум ${MIN_QUESTIONS}` },
        { status: 400 }
      );
    }

    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, actualQuestionCount);

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
      totalQuestions: actualQuestionCount,
      startedAt: new Date(),
      status: "in_progress",
    });

    await adminRealtimeDb.ref(`activeTests/${testRef.id}`).set({
      userId: session.id,
      userEmail: session.email,
      userName: `${session.firstName} ${session.lastName}`,
      startedAt: Date.now(),
      answeredCount: 0,
      totalQuestions: actualQuestionCount,
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
