import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, isQuotaExceededError } from "@/lib/firebase-admin";

export interface ReviewQuestion {
  questionId: string;
  text: string;
  options: string[];
  userAnswer: number | null;
  correctAnswer: number | null;
}

export interface TestDetails {
  id: string;
  userName: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: number | null;
  questions: ReviewQuestion[];
}

// Completed tests are immutable, so details are cached in module memory to
// keep repeated views from re-reading the test doc plus every question doc
// (the free-tier daily read quota has been exhausted by polling before).
const CACHE_TTL_MS = 5 * 60_000;
const CACHE_MAX_ENTRIES = 200;
const detailsCache = new Map<string, { data: TestDetails; fetchedAt: number }>();

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const testId = request.nextUrl.searchParams.get("testId");
    if (!testId) {
      return NextResponse.json({ success: false, error: "Test ID required" }, { status: 400 });
    }

    const cached = detailsCache.get(testId);
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, test: cached.data });
    }

    const testDoc = await adminDb.collection("tests").doc(testId).get();
    if (!testDoc.exists) {
      return NextResponse.json({ success: false, error: "Тест не найден" }, { status: 404 });
    }

    const testData = testDoc.data()!;
    if (testData.status !== "completed") {
      return NextResponse.json({ success: false, error: "Тест еще не завершен" }, { status: 400 });
    }

    const testQuestions: { questionId: string; text: string; options: string[] }[] =
      testData.questions || [];
    const answers: Record<string, number> = testData.answers || {};

    // Correct answers live in the questions collection, not on the test doc.
    // getAll batches this into one round-trip; a question deleted since the
    // test was taken simply comes back as non-existent (correctAnswer: null).
    const questionRefs = testQuestions.map((q) =>
      adminDb.collection("questions").doc(q.questionId)
    );
    const questionDocs = questionRefs.length > 0 ? await adminDb.getAll(...questionRefs) : [];
    const correctAnswers = new Map<string, number>();
    questionDocs.forEach((doc) => {
      if (doc.exists) {
        correctAnswers.set(doc.id, doc.data()!.correctAnswer as number);
      }
    });

    const details: TestDetails = {
      id: testDoc.id,
      userName: testData.userName || "",
      userEmail: testData.userEmail || "",
      score: testData.score ?? 0,
      totalQuestions: testData.totalQuestions ?? testQuestions.length,
      percentage: testData.percentage ?? 0,
      completedAt:
        testData.completedAt?.toMillis?.() ??
        testData.completedAt?.toDate?.()?.getTime?.() ??
        (typeof testData.completedAt === "number" ? testData.completedAt : null),
      questions: testQuestions.map((q) => ({
        questionId: q.questionId,
        text: q.text,
        options: q.options,
        userAnswer: answers[q.questionId] ?? null,
        correctAnswer: correctAnswers.get(q.questionId) ?? null,
      })),
    };

    if (detailsCache.size >= CACHE_MAX_ENTRIES) {
      const oldestKey = detailsCache.keys().next().value;
      if (oldestKey !== undefined) detailsCache.delete(oldestKey);
    }
    detailsCache.set(testId, { data: details, fetchedAt: Date.now() });

    return NextResponse.json({ success: true, test: details });
  } catch (error) {
    console.error("Test details error:", error);
    if (isQuotaExceededError(error)) {
      return NextResponse.json(
        { success: false, error: "Превышена дневная квота базы данных. Попробуйте позже." },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: false, error: "Ошибка загрузки результатов" }, { status: 500 });
  }
}
