import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const questionsSnapshot = await adminDb.collection("questions").orderBy("createdAt", "desc").limit(100).get();
    
    const questions = questionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { questionId } = await request.json();
    
    if (!questionId) {
      return NextResponse.json({ success: false, error: "Question ID required" }, { status: 400 });
    }

    await adminDb.collection("questions").doc(questionId).delete();

    return NextResponse.json({ success: true, message: "Question deleted" });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ success: false, error: "Failed to delete question" }, { status: 500 });
  }
}
