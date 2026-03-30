import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const usersSnapshot = await adminDb.collection("users")
      .limit(200)
      .get();

    const users = usersSnapshot.docs
      .filter((doc) => doc.data().role !== "admin")
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
        testWindowStart: doc.data().testWindowStart?.toDate?.()?.toISOString() || null,
        testWindowEnd: doc.data().testWindowEnd?.toDate?.()?.toISOString() || null,
      }));

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json({ success: false, error: "Failed to get users" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, testWindowStart, testWindowEnd } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (testWindowStart) {
      updateData.testWindowStart = new Date(testWindowStart);
    } else if (testWindowStart === null) {
      updateData.testWindowStart = null;
    }

    if (testWindowEnd) {
      updateData.testWindowEnd = new Date(testWindowEnd);
    } else if (testWindowEnd === null) {
      updateData.testWindowEnd = null;
    }

    await adminDb.collection("users").doc(userId).update(updateData);

    return NextResponse.json({ success: true, message: "User updated" });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: "User ID required" }, { status: 400 });
    }

    await adminDb.collection("users").doc(userId).delete();

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}
