export interface User {
  id: string;
  email: string;
  iin: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category?: string;
  createdAt: Date;
}

export interface Test {
  id: string;
  userId: string;
  questions: TestQuestion[];
  answers: Record<string, number>;
  score?: number;
  totalQuestions: number;
  startedAt: Date;
  completedAt?: Date;
  status: "in_progress" | "completed";
}

export interface TestQuestion {
  questionId: string;
  text: string;
  options: string[];
}

export interface TestResult {
  id: string;
  testId: string;
  userId: string;
  userEmail: string;
  userName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalTests: number;
  averageScore: number;
  activeTests: number;
}
