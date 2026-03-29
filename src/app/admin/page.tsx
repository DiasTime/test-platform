"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FileUpload } from "@/components/ui/FileUpload";
import { ref, onValue, off } from "firebase/database";
import { realtimeDb } from "@/lib/firebase";

interface ActiveTest {
  userId: string;
  userEmail: string;
  userName: string;
  startedAt: number;
  answeredCount: number;
  totalQuestions: number;
  status: string;
}

interface CompletedTest {
  userId: string;
  userEmail: string;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: number;
}

interface Stats {
  totalQuestions: number;
  totalUsers: number;
  totalTests: number;
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  createdAt?: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "questions" | "users">("dashboard");
  const [activeTests, setActiveTests] = useState<Record<string, ActiveTest>>({});
  const [completedTests, setCompletedTests] = useState<Record<string, CompletedTest>>({});
  const [stats, setStats] = useState<Stats>({ totalQuestions: 0, totalUsers: 0, totalTests: 0 });
  const [importResult, setImportResult] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    try {
      const res = await fetch("/api/admin/questions");
      const data = await res.json();
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/cleanup", { method: "POST" }).catch(() => {});

    const activeRef = ref(realtimeDb, "activeTests");
    const completedRef = ref(realtimeDb, "completedTests");

    onValue(activeRef, (snapshot) => {
      setActiveTests(snapshot.val() || {});
    });

    onValue(completedRef, (snapshot) => {
      setCompletedTests(snapshot.val() || {});
    });

    fetchStats();
    fetchQuestions();

    return () => {
      off(activeRef);
      off(completedRef);
    };
  }, [fetchQuestions]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleQuestionsUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import-questions", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setImportResult({ type: "success", message: data.message });
        fetchStats();
        fetchQuestions();
      } else {
        setImportResult({ type: "error", message: data.error });
      }
    } catch {
      setImportResult({ type: "error", message: "Ошибка загрузки файла" });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Удалить этот вопрос?")) return;
    
    try {
      const res = await fetch("/api/admin/questions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      const data = await res.json();
      
      if (data.success) {
        setQuestions(questions.filter(q => q.id !== questionId));
        fetchStats();
      }
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleExport = async (format: "csv" | "json") => {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/export?format=${format}`);
      
      if (format === "json") {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data.results, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `test-results-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `test-results-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  };

  const handleUsersUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/import-users", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setImportResult({ type: "success", message: data.message });
        fetchStats();
      } else {
        setImportResult({ type: "error", message: data.error });
      }
    } catch {
      setImportResult({ type: "error", message: "Ошибка загрузки файла" });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("ru-RU");
  };

  const activeTestsList = Object.entries(activeTests);
  const completedTestsList = Object.entries(completedTests).sort(
    ([, a], [, b]) => b.completedAt - a.completedAt
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Админ-панель</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Выйти
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </span>
          </button>
          <button
            onClick={() => setActiveTab("questions")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "questions"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Вопросы
            </span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Пользователи
            </span>
          </button>
        </div>

        {importResult && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center justify-between ${
              importResult.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <div className="flex items-center gap-3">
              {importResult.type === "success" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {importResult.message}
            </div>
            <button
              onClick={() => setImportResult(null)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Обзор</h2>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleExport("csv")}
                  disabled={exporting}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Экспорт CSV
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleExport("json")}
                  disabled={exporting}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Экспорт JSON
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card hover className="group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalQuestions}</p>
                    <p className="text-slate-500 text-sm">Вопросов</p>
                  </div>
                </div>
              </Card>
              <Card hover className="group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                    <p className="text-slate-500 text-sm">Пользователей</p>
                  </div>
                </div>
              </Card>
              <Card hover className="group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{activeTestsList.length}</p>
                    <p className="text-slate-500 text-sm">Активных</p>
                  </div>
                </div>
              </Card>
              <Card hover className="group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">{completedTestsList.length}</p>
                    <p className="text-slate-500 text-sm">Завершено</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card>
              <div className="flex items-center gap-3 mb-5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <h2 className="text-lg font-semibold text-slate-900">Активные тесты</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Real-time</span>
              </div>
              {activeTestsList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500">Нет активных тестов</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Пользователь</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Прогресс</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Начат</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeTestsList.map(([id, test]) => (
                        <tr key={id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">{test.userName}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{test.userEmail}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-slate-200 rounded-full h-1.5">
                                <div
                                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                                  style={{ width: `${(test.answeredCount / test.totalQuestions) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {test.answeredCount}/{test.totalQuestions}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {formatTime(test.startedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-5">Завершенные тесты</h2>
              {completedTestsList.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-slate-500">Нет завершенных тестов</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Пользователь</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Результат</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Завершен</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Сертификат</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {completedTestsList.slice(0, 20).map(([id, test]) => (
                        <tr key={id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 text-sm font-medium text-slate-900">{test.userName}</td>
                          <td className="py-3 px-4 text-sm text-slate-600">{test.userEmail}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                test.percentage >= 70
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {test.score}/{test.totalQuestions} ({test.percentage}%)
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-500">
                            {formatTime(test.completedAt)}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => window.open(`/api/admin/certificate?testId=${id}`, '_blank')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                              title="Скачать сертификат"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Сертификат
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "questions" && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Импорт вопросов из Word</h2>
              <FileUpload
                onUpload={handleQuestionsUpload}
                accept=".docx,.doc"
                label="Загрузите файл с вопросами"
                description="Формат: номер вопроса, текст, варианты A-D с отметкой правильного (*)"
              />
              <details className="mt-5">
                <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">Показать пример формата</summary>
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-200">
{`1. Какой язык программирования используется в Next.js?
A) Python
B) JavaScript *
C) Ruby
D) PHP`}
                  </pre>
                </div>
              </details>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Загруженные вопросы
                  <span className="ml-2 text-sm font-normal text-slate-500">({questions.length})</span>
                </h2>
                <Button variant="ghost" size="sm" onClick={fetchQuestions} disabled={loadingQuestions}>
                  <svg className={`w-4 h-4 mr-1.5 ${loadingQuestions ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Обновить
                </Button>
              </div>

              {loadingQuestions ? (
                <div className="text-center py-8">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="text-slate-500">Загрузка вопросов...</p>
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500">Нет загруженных вопросов</p>
                  <p className="text-slate-400 text-sm mt-1">Загрузите файл Word с вопросами выше</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {questions.map((question, idx) => (
                    <div key={question.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                              {idx + 1}
                            </span>
                            <p className="text-sm font-medium text-slate-900 truncate">{question.text}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            {question.options.map((option, optIdx) => (
                              <div
                                key={optIdx}
                                className={`text-xs px-2 py-1.5 rounded-lg ${
                                  optIdx === question.correctAnswer
                                    ? "bg-emerald-100 text-emerald-700 font-medium"
                                    : "bg-white text-slate-600 border border-slate-200"
                                }`}
                              >
                                <span className="font-semibold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                                {option}
                                {optIdx === question.correctAnswer && (
                                  <svg className="w-3 h-3 inline ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Удалить вопрос"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Импорт пользователей из Word</h2>
              <FileUpload
                onUpload={handleUsersUpload}
                accept=".docx,.doc"
                label="Загрузите файл с пользователями"
                description="Формат: email, ИИН, имя, фамилия (через запятую или табуляцию)"
              />
              <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h3 className="font-medium text-slate-700 mb-2 text-sm">Пример формата:</h3>
                <pre className="text-sm text-slate-600 whitespace-pre-wrap font-mono bg-white p-3 rounded-lg border border-slate-200">
{`user1@example.com, 123456789012, Иван, Иванов
user2@example.com, 234567890123, Петр, Петров
user3@example.com, 345678901234, Мария, Сидорова`}
                </pre>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
