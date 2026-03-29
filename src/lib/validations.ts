import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Неверный формат email"),
  iin: z
    .string()
    .length(12, "ИИН должен содержать 12 цифр")
    .regex(/^\d+$/, "ИИН должен содержать только цифры"),
  firstName: z.string().min(2, "Имя должно содержать минимум 2 символа"),
  lastName: z.string().min(2, "Фамилия должна содержать минимум 2 символа"),
});

export const questionSchema = z.object({
  text: z.string().min(10, "Вопрос должен содержать минимум 10 символов"),
  options: z
    .array(z.string().min(1))
    .min(2, "Минимум 2 варианта ответа")
    .max(6, "Максимум 6 вариантов ответа"),
  correctAnswer: z.number().min(0),
  category: z.string().optional(),
});

export const userImportSchema = z.object({
  email: z.string().email(),
  iin: z.string().length(12).regex(/^\d+$/),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const answerSchema = z.object({
  testId: z.string().min(1),
  questionId: z.string().min(1),
  answer: z.number().min(0).max(5),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type UserImportInput = z.infer<typeof userImportSchema>;
export type AnswerInput = z.infer<typeof answerSchema>;
