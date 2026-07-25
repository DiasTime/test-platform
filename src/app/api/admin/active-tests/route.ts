import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb, adminRealtimeDb, isQuotaExceededError } from "@/lib/firebase-admin";

// Reads live test state server-side via the admin SDK. The client can't read
// the Realtime Database directly because the app authenticates with a JWT
// cookie (not Firebase Auth), so RTDB rules would block unauthenticated reads.
//
// Active tests are live-only state, so they come from the Realtime Database.
// Completed tests are read from Firestore (the source of truth) so they still
// display even if the RTDB mirror write failed.
//
// The admin dashboard polls this endpoint every few seconds. Completed tests
// are immutable once written, so the Firestore query is cached in module
// memory and refreshed on a TTL — re-running it on every poll multiplied
// reads by the poll rate and exhausted the free-tier daily read quota
// ("8 RESOURCE EXHAUSTED: Quota exceeded"). Tests completed between refreshes
// still appear immediately via the RTDB completedTests mirror, which is
// merged on top of the cached data on every request.
const COMPLETED_CACHE_TTL_MS = 60_000;
let completedCache: { data: Record<string, unknown>; fetchedAt: number } | null = null;

async function getCompletedTestsFromFirestore(): Promise<Record<string, unknown>> {
  if (completedCache && Date.now() - completedCache.fetchedAt < COMPLETED_CACHE_TTL_MS) {
    return completedCache.data;
  }

  try {
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

    completedCache = { data: completedTests, fetchedAt: Date.now() };
    return completedTests;
  } catch (error) {
    // Serve stale data rather than failing the whole dashboard — especially
    // when the failure is the quota itself.
    if (completedCache) {
      console.error("Completed tests refresh failed, serving cached data:", error);
      return completedCache.data;
    }
    throw error;
  }
}

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

    const completedTests: Record<string, unknown> = {
      ...(await getCompletedTestsFromFirestore()),
    };

    // Merge the RTDB mirror so tests submitted since the last Firestore
    // refresh show up without waiting out the cache TTL.
    try {
      const mirrorSnap = await adminRealtimeDb.ref("completedTests").once("value");
      Object.assign(completedTests, mirrorSnap.val() || {});
    } catch (rtdbError) {
      console.error("Completed tests (RTDB mirror) fetch error:", rtdbError);
    }

    return NextResponse.json({ success: true, activeTests, completedTests });
  } catch (error) {
    console.error("Active tests fetch error:", error);
    if (isQuotaExceededError(error)) {
      return NextResponse.json(
        { success: false, error: "Превышена дневная квота базы данных. Попробуйте позже." },
        { status: 503 }
      );
    }
    return NextResponse.json({ success: false, error: "Ошибка загрузки тестов" }, { status: 500 });
  }
}
