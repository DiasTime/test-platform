import { NextResponse } from "next/server";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const activeTestsRef = adminRealtimeDb.ref("activeTests");
    const snapshot = await activeTestsRef.once("value");
    const activeTests = snapshot.val() || {};

    let removedCount = 0;

    for (const [testId, testData] of Object.entries(activeTests)) {
      const testDoc = await adminDb.collection("tests").doc(testId).get();
      
      if (!testDoc.exists) {
        await adminRealtimeDb.ref(`activeTests/${testId}`).remove();
        removedCount++;
        continue;
      }

      const test = testDoc.data();
      if (test?.status === "completed") {
        await adminRealtimeDb.ref(`activeTests/${testId}`).remove();
        removedCount++;
      }
    }

    return NextResponse.json({ success: true, removedCount });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ success: false, error: "Failed to cleanup" }, { status: 500 });
  }
}
