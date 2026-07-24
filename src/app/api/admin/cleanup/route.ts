import { NextResponse } from "next/server";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const now = Date.now();
    const activeTestsRef = adminRealtimeDb.ref("activeTests");
    const snapshot = await activeTestsRef.once("value");
    const activeTests = snapshot.val() || {};

    let removedCount = 0;
    let finalizedCount = 0;

    for (const [testId] of Object.entries(activeTests)) {
      const testDoc = await adminDb.collection("tests").doc(testId).get();

      if (!testDoc.exists) {
        await adminRealtimeDb.ref(`activeTests/${testId}`).remove();
        removedCount++;
        continue;
      }

      const test = testDoc.data()!;

      if (test.status === "completed") {
        await adminRealtimeDb.ref(`activeTests/${testId}`).remove();
        removedCount++;
        continue;
      }

      if (test.status === "in_progress") {
        // Safety net for abandoned tabs: if the user's time window has ended,
        // grade whatever was answered and finalize the test server-side.
        const userDoc = await adminDb.collection("users").doc(test.userId).get();
        const end = userDoc.exists ? userDoc.data()?.testWindowEnd?.toDate?.() : null;

        if (end && now > end.getTime()) {
          let correctCount = 0;
          const answers = test.answers || {};

          for (const q of test.questions || []) {
            const qDoc = await adminDb.collection("questions").doc(q.questionId).get();
            if (qDoc.exists && answers[q.questionId] === qDoc.data()!.correctAnswer) {
              correctCount++;
            }
          }

          const totalQuestions = test.totalQuestions || (test.questions?.length ?? 0);
          const percentage = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

          await adminDb.collection("tests").doc(testId).update({
            score: correctCount,
            percentage,
            completedAt: new Date(),
            status: "completed",
            autoSubmitted: true,
          });

          await adminRealtimeDb.ref(`activeTests/${testId}`).remove();
          await adminRealtimeDb.ref(`completedTests/${testId}`).set({
            userId: test.userId,
            userEmail: test.userEmail,
            userName: test.userName,
            score: correctCount,
            totalQuestions,
            percentage,
            completedAt: Date.now(),
          });

          finalizedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, removedCount, finalizedCount });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ success: false, error: "Failed to cleanup" }, { status: 500 });
  }
}
