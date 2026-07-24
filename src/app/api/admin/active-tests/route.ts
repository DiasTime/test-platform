import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

// Reads live test state server-side via the admin SDK. The client can't read
// the Realtime Database directly because the app authenticates with a JWT
// cookie (not Firebase Auth), so RTDB rules would block unauthenticated reads.
//
// Active tests are live-only state, so they come from the Realtime Database.
// Completed tests are read from Firestore (the source of truth) so they still
// display even if the RTDB mirror write failed.
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    let activeTests: Record<string, unknown> = {};
    try {
      const activeSnap = await adminRealtimeDb.ref("activeTests").once("value");
      activeTests = activeSnap.val() || {};
    } catch (rtdbError) {
      // RTDB may be misconfigured; completed tests must still load.
      console.error("Active tests (RTDB) fetch error:", rtdbError);
    }

    const completedSnap = await adminDb
      .collection("tests")
      .where("status", "==", "completed")
      .get();

    const completedTests: Record<string, unknown> = {};
    completedSnap.docs.forEach((doc) => {
      const d = doc.data();
      const completedAt =
        d.completedAt?.toMillis?.() ??
        d.completedAt?.toDate?.()?.getTime?.() ??
        (typeof d.completedAt === "number" ? d.completedAt : Date.now());
      completedTests[doc.id] = {
        userId: d.userId,
        userEmail: d.userEmail,
        userName: d.userName,
        score: d.score ?? 0,
        totalQuestions: d.totalQuestions ?? 0,
        percentage: d.percentage ?? 0,
        completedAt,
      };
    });

    return NextResponse.json({ success: true, activeTests, completedTests });
  } catch (error) {
    console.error("Active tests fetch error:", error);
    return NextResponse.json({ success: false, error: "Ошибка загрузки тестов" }, { status: 500 });
  }
}
