"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";

interface ReviewQuestion {
  questionId: string;
  text: string;
  options: string[];
  userAnswer: number | null;
  correctAnswer: number | null;
}

interface TestDetails {
  id: string;
  userName: string;
  userEmail: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: number | null;
  questions: ReviewQuestion[];
}

interface TestReviewModalProps {
  testId: string;
  onClose: () => void;
}

// Правильно ли отвечен вопрос: null — определить нельзя (вопрос удалён из базы
// или пользователь не ответил).
function questionVerdict(q: ReviewQuestion): boolean | null {
  if (q.correctAnswer === null || q.userAnswer === null) return null;
  return q.userAnswer === q.correctAnswer;
}

const cleanOption = (option: string) => option.replace(/\s*[*+✓]+\s*$/, "");

export function TestReviewModal({ testId, onClose }: TestReviewModalProps) {
  const [details, setDetails] = useState<TestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/test-details?testId=${encodeURIComponent(testId)}`);
      const data = await res.json();
      if (data.success) {
        setDetails(data.test);
      } else {
        setError(data.error || "Ошибка загрузки результатов");
      }
    } catch {
      setError("Ошибка загрузки результатов");
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIndex((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight" && details) {
        setCurrentIndex((i) => Math.min(details.questions.length - 1, i + 1));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, details]);

  // Пока модалка открыта, страница под ней не должна скроллиться.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const questions = details?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const correctCount = questions.filter((q) => questionVerdict(q) === true).length;
  const wrongCount = questions.filter((q) => questionVerdict(q) === false).length;
  const unknownCount = questions.length - correctCount - wrongCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Результаты теста"
    >
      <div
        className="bg-slate-50 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl sm:rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-900">Результаты теста</h2>
              {details && (
                <p className="text-sm text-slate-500 truncate">
                  {details.userName} · {details.userEmail}
                  {details.completedAt && (
                    <span className="hidden sm:inline">
                      {" "}· {new Date(details.completedAt).toLocaleString("ru-RU")}
                    </span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              title="Закрыть"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {details && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-semibold ${
                  details.percentage >= 70
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {details.score}/{details.totalQuestions} ({details.percentage}%)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Правильно: {correctCount}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Неправильно: {wrongCount}
              </span>
              {unknownCount > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                  Без оценки: {unknownCount}
                </span>
              )}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-slate-500">Загрузка результатов...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-700 font-medium mb-4">{error}</p>
              <Button variant="secondary" size="sm" onClick={fetchDetails}>
                Повторить
              </Button>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="mb-4">
                <div className="flex gap-1.5 flex-wrap">
                  {questions.map((q, idx) => {
                    const verdict = questionVerdict(q);
                    return (
                      <button
                        key={q.questionId}
                        onClick={() => setCurrentIndex(idx)}
                        title={
                          verdict === true
                            ? "Правильный ответ"
                            : verdict === false
                            ? "Неправильный ответ"
                            : "Нет данных для оценки"
                        }
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                          idx === currentIndex ? "ring-2 ring-blue-500 ring-offset-2 scale-105 " : ""
                        }${
                          verdict === true
                            ? "bg-emerald-500 text-white hover:bg-emerald-600"
                            : verdict === false
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-4 sm:p-6 animate-fade-in">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
                      Вопрос {currentIndex + 1} из {questions.length}
                    </span>
                    {questionVerdict(currentQuestion) === true && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Отвечен правильно
                      </span>
                    )}
                    {questionVerdict(currentQuestion) === false && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Отвечен неправильно
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
                    {currentQuestion.text}
                  </h3>
                </div>

                {currentQuestion.userAnswer === null && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl">
                    Пользователь не ответил на этот вопрос.
                  </div>
                )}
                {currentQuestion.correctAnswer === null && (
                  <div className="mb-4 p-3 bg-slate-100 border border-slate-200 text-slate-600 text-sm rounded-xl">
                    Вопрос был удалён из базы — правильный ответ недоступен.
                  </div>
                )}

                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isCorrect = currentQuestion.correctAnswer === idx;
                    const isUserChoice = currentQuestion.userAnswer === idx;
                    const isWrongChoice = isUserChoice && currentQuestion.correctAnswer !== null && !isCorrect;

                    return (
                      <div
                        key={idx}
                        className={`w-full p-4 text-left rounded-xl border-2 ${
                          isCorrect
                            ? "border-emerald-500 bg-emerald-50"
                            : isWrongChoice
                            ? "border-red-500 bg-red-50"
                            : isUserChoice
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold flex-shrink-0 ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : isWrongChoice
                                ? "bg-red-600 text-white"
                                : isUserChoice
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <span className="text-slate-800">{cleanOption(option)}</span>
                            <div className="flex flex-wrap gap-2 mt-1.5 empty:hidden">
                              {isCorrect && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Правильный ответ
                                </span>
                              )}
                              {isUserChoice && (
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                    isWrongChoice
                                      ? "text-red-700"
                                      : isCorrect
                                      ? "text-emerald-700"
                                      : "text-blue-700"
                                  }`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Выбор пользователя
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Назад
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    disabled={currentIndex === questions.length - 1}
                  >
                    Далее
                    <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500">Нет вопросов для отображения</div>
          )}
        </div>
      </div>
    </div>
  );
}
