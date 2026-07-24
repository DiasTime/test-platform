import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminRealtimeDb } from "@/lib/firebase-admin";

// Reads live test state server-side via the admin SDK. The client can't read
// the Realtime Database directly because the app authenticates with a JWT
// cookie (not Firebase Auth), so RTDB rules would block unauthenticated reads.
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const [activeSnap, completedSnap] = await Promise.all([
      adminRealtimeDb.ref("activeTests").once("value"),
      adminRealtimeDb.ref("completedTests").once("value"),
    ]);

    return NextResponse.json({
      success: true,
      activeTests: activeSnap.val() || {},
      completedTests: completedSnap.val() || {},
    });
  } catch (error) {
    console.error("Active tests fetch error:", error);
    return NextResponse.json({ success: false, error: "Ошибка загрузки тестов" }, { status: 500 });
  }
}
