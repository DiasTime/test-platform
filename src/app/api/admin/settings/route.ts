import { NextRequest, NextResponse } from "next/server";
import { adminRealtimeDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const snapshot = await adminRealtimeDb.ref("settings").once("value");
    const settings = snapshot.val() || { questionCount: 20 };
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to get settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionCount } = body;

    if (questionCount !== undefined) {
      const count = Math.max(5, Math.min(200, Number(questionCount)));
      await adminRealtimeDb.ref("settings/questionCount").set(count);
    }

    const snapshot = await adminRealtimeDb.ref("settings").once("value");
    const settings = snapshot.val();

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
