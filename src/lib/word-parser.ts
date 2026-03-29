import mammoth from "mammoth";

export interface ParsedQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface ParsedUser {
  email: string;
  iin: string;
  firstName: string;
  lastName: string;
}

export async function parseQuestionsFromWord(buffer: Buffer): Promise<ParsedQuestion[]> {
  const result = await mammoth.extractRawText({ buffer });
  let text = result.value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  // Insert newlines before options (A) B) C) D)) if they're on the same line
  text = text.replace(/([A-D])\)/g, "\n$1)");
  // Insert newlines before question numbers
  text = text.replace(/(\d+)\./g, "\n$1.");
  
  const questions: ParsedQuestion[] = [];
  const lines = text.split(/\n/).filter((line) => line.trim());
  let currentQuestion: { text: string; options: string[]; correctAnswer: number } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a question (starts with number like "1." or "1)")
    const questionMatch = trimmedLine.match(/^(\d+)[.\)]\s*(.+)/);
    // Check if line is an option (starts with A) B) C) D))
    const optionMatch = trimmedLine.match(/^([A-Da-d])[.\)]\s*(.+)/);

    if (questionMatch && !optionMatch) {
      if (currentQuestion && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
      }
      currentQuestion = {
        text: questionMatch[2].trim(),
        options: [],
        correctAnswer: 0,
      };
    } else if (optionMatch && currentQuestion) {
      let optionText = optionMatch[2].trim();
      const isCorrect = optionText.includes("*") || optionText.includes("+") || optionText.includes("✓");
      if (isCorrect) {
        currentQuestion.correctAnswer = currentQuestion.options.length;
        optionText = optionText.replace(/[\*\+✓]/g, "").trim();
      }
      currentQuestion.options.push(optionText);
    }
  }

  if (currentQuestion && currentQuestion.options.length >= 2) {
    questions.push(currentQuestion);
  }

  console.log("Parsed questions count:", questions.length);
  return questions;
}

export async function parseUsersFromWord(buffer: Buffer): Promise<ParsedUser[]> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;
  const users: ParsedUser[] = [];

  const lines = text.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    const parts = line.split(/[,;\t]+/).map((p) => p.trim());

    if (parts.length >= 4) {
      const [email, iin, firstName, lastName] = parts;

      if (email.includes("@") && /^\d{12}$/.test(iin)) {
        users.push({ email, iin, firstName, lastName });
      }
    } else {
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      const iinMatch = line.match(/\b\d{12}\b/);
      const nameMatch = line.match(/([А-Яа-яЁё]+)\s+([А-Яа-яЁё]+)/);

      if (emailMatch && iinMatch && nameMatch) {
        users.push({
          email: emailMatch[0],
          iin: iinMatch[0],
          firstName: nameMatch[1],
          lastName: nameMatch[2],
        });
      }
    }
  }

  return users;
}
