"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Question {
  questionId: string;
  text: string;
  options: string[];
}

interface TestResult {
  score: number;
  totalQuestions: number;
  percentage: number;
}

export default function TestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [testId, setTestId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [waitingMessage, setWaitingMessage] = useState("");

  useEffect(() => {
    startTest();
  }, []);

  const startTest = async () => {
    try {
      const res = await fetch("/api/test/start", { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        setError(data.error);
        setErrorCode(data.errorCode || "");
        if (data.errorCode === "NOT_STARTED") {
          setWaitingMessage(data.error);
        }
        return;
      }

      setTestId(data.testId);
      setQuestions(data.questions);

      if (data.resuming) {
        const testRes = await fetch(`/api/test/${data.testId}`);
        const testData = await testRes.json();
        if (testData.success && testData.answers) {
          setAnswers(testData.answers);
        }
      }
    } catch {
      setError("Ошибка загрузки теста");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answerIndex: number) => {
    if (!testId) return;

    const question = questions[currentIndex];
    const newAnswers = { ...answers, [question.questionId]: answerIndex };
    setAnswers(newAnswers);

    try {
      await fetch("/api/test/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testId,
          questionId: question.questionId,
          answer: answerIndex,
        }),
      });
    } catch {
      console.error("Failed to save answer");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!testId) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testId }),
      });

      const data = await res.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Ошибка при отправке теста");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка теста...</p>
        </div>
      </div>
    );
  }

  if (errorCode === "NOT_STARTED" && waitingMessage) {
    const timeMatch = waitingMessage.match(/(\d{2}\.\d{2}\.\d{4},?\s*\d{2}:\d{2})/);
    const scheduledTime = timeMatch ? timeMatch[1] : "";
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Здравствуйте!</h1>
            <p className="text-slate-600 text-lg">Добро пожаловать на тестирование</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
            <p className="text-slate-700 mb-3">Ваше тестирование запланировано на:</p>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xl font-semibold text-blue-700">{scheduledTime}</span>
            </div>
          </div>
          
          <p className="text-slate-500 text-sm mb-6">
            Пожалуйста, вернитесь в указанное время. Страница обновится автоматически.
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => window.location.reload()}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Обновить
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Выйти
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (errorCode === "NO_TIME_ASSIGNED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Здравствуйте!</h1>
            <p className="text-slate-600 text-lg">Добро пожаловать на тестирование</p>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-6">
            <p className="text-slate-700">
              Время для прохождения теста ещё не назначено. Пожалуйста, обратитесь к администратору.
            </p>
          </div>
          
          <Button variant="ghost" onClick={handleLogout}>
            Выйти
          </Button>
        </Card>
      </div>
    );
  }

  if (errorCode === "EXPIRED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Время истекло</h1>
          </div>
          
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-6 mb-6">
            <p className="text-slate-700">
              К сожалению, время для прохождения теста истекло. Обратитесь к администратору для получения нового времени.
            </p>
          </div>
          
          <Button variant="ghost" onClick={handleLogout}>
            Выйти
          </Button>
        </Card>
      </div>
    );
  }

  if (errorCode === "ALREADY_COMPLETED") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Тестирование пройдено</h1>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
            <p className="text-slate-700">
              Вы уже прошли тестирование. Повторное прохождение невозможно. Результаты тестирования вам сообщит администратор.
            </p>
          </div>
          
          <Button variant="ghost" onClick={handleLogout}>
            Выйти
          </Button>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleLogout}>Выйти</Button>
        </Card>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-100">
              <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Тестирование окончено!</h2>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-gray-700">
              Спасибо за прохождение теста. Результаты тестирования вам сообшит администратор.
            </p>
          </div>
          <Button onClick={handleLogout} className="w-full">
            Выйти
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-lg font-semibold text-slate-900">Тестирование</h1>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">
              {answeredCount} / {questions.length}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="flex gap-1.5 flex-wrap">
            {questions.map((q, idx) => (
              <button
                key={q.questionId}
                onClick={() => setCurrentIndex(idx)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                  idx === currentIndex
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-105"
                    : answers[q.questionId] !== undefined
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <Card className="animate-fade-in">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full mb-3">
              Вопрос {currentIndex + 1} из {questions.length}
            </span>
            <h2 className="text-xl font-semibold text-slate-900 leading-relaxed">{currentQuestion.text}</h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                  answers[currentQuestion.questionId] === idx
                    ? "border-blue-500 bg-blue-50 shadow-sm"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-semibold flex-shrink-0 ${
                    answers[currentQuestion.questionId] === idx
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-slate-800 pt-0.5">{option}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
            <Button variant="secondary" onClick={handlePrev} disabled={currentIndex === 0}>
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={answeredCount < questions.length}
              >
                Завершить тест
                <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Далее
                <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
