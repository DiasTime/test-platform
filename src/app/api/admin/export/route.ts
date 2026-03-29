import { NextResponse } from "next/server";
import { adminDb, adminRealtimeDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "csv";

    const completedTestsRef = adminRealtimeDb.ref("completedTests");
    const snapshot = await completedTestsRef.once("value");
    const completedTests = snapshot.val() || {};

    const results = await Promise.all(
      Object.entries(completedTests).map(async ([testId, testData]) => {
        const test = testData as {
          userId: string;
          userEmail: string;
          userName: string;
          score: number;
          totalQuestions: number;
          percentage: number;
          completedAt: number;
        };

        let userIIN = "N/A";
        if (test.userId) {
          try {
            const userDoc = await adminDb.collection("users").doc(test.userId).get();
            if (userDoc.exists) {
              userIIN = userDoc.data()?.iin || "N/A";
            }
          } catch {
            userIIN = "N/A";
          }
        }

        return {
          testId,
          userEmail: test.userEmail || "N/A",
          userName: test.userName || "N/A",
          userIIN,
          score: test.score || 0,
          totalQuestions: test.totalQuestions || 0,
          percentage: test.percentage || 0,
          passed: test.percentage >= 70,
          completedAt: test.completedAt ? new Date(test.completedAt).toISOString() : "N/A",
        };
      })
    );

    results.sort((a, b) => {
      if (a.completedAt === "N/A") return 1;
      if (b.completedAt === "N/A") return -1;
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });

    if (format === "json") {
      return NextResponse.json({ success: true, results });
    }

    const headers = ["ID теста", "Email", "ФИО", "ИИН", "Баллы", "Всего вопросов", "Процент", "Сдал", "Завершен"];
    const csvRows = [
      headers.join(";"),
      ...results.map((r) =>
        [
          r.testId,
          r.userEmail,
          r.userName,
          `="${r.userIIN}"`,
          r.score,
          r.totalQuestions,
          `${r.percentage}%`,
          r.passed ? "Да" : "Нет",
          r.completedAt.replace("T", " ").replace("Z", ""),
        ].join(";")
      ),
    ];

    const csvContent = "\uFEFF" + csvRows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="test-results-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting results:", error);
    return NextResponse.json({ success: false, error: "Failed to export results" }, { status: 500 });
  }
}
