import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { parseQuestionsFromWord } from "@/lib/word-parser";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: "Доступ запрещен" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "Файл не загружен" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const questions = await parseQuestionsFromWord(buffer);

    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Не удалось распознать вопросы в файле" },
        { status: 400 }
      );
    }

    const batch = adminDb.batch();
    const questionsRef = adminDb.collection("questions");

    for (const question of questions) {
      const docRef = questionsRef.doc();
      batch.set(docRef, {
        ...question,
        createdAt: new Date(),
        createdBy: session.id,
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      imported: questions.length,
      message: `Успешно импортировано ${questions.length} вопросов`,
    });
  } catch (error) {
    console.error("Import questions error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при импорте вопросов" },
      { status: 500 }
    );
  }
}
