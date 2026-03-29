import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { parseUsersFromWord } from "@/lib/word-parser";

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
    const users = await parseUsersFromWord(buffer);

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: "Не удалось распознать пользователей в файле" },
        { status: 400 }
      );
    }

    const usersRef = adminDb.collection("users");
    let imported = 0;
    let skipped = 0;

    for (const user of users) {
      const existingEmail = await usersRef.where("email", "==", user.email).limit(1).get();
      const existingIin = await usersRef.where("iin", "==", user.iin).limit(1).get();

      if (!existingEmail.empty || !existingIin.empty) {
        skipped++;
        continue;
      }

      await usersRef.add({
        ...user,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        importedBy: session.id,
      });
      imported++;
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      message: `Импортировано: ${imported}, пропущено (дубликаты): ${skipped}`,
    });
  } catch (error) {
    console.error("Import users error:", error);
    return NextResponse.json(
      { success: false, error: "Ошибка при импорте пользователей" },
      { status: 500 }
    );
  }
}
