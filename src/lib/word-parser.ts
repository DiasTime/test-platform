import mammoth from "mammoth";
import AdmZip from "adm-zip";

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

// Correct answer in numbered formats can be flagged with a trailing *, + or ✓
// (e.g. "1.2.4 В составе органа...*"). Strip the marker so it never leaks into
// the option text shown to test-takers.
function extractCorrectMarker(optionText: string): { text: string; isCorrect: boolean } {
  const trimmed = optionText.trim();
  const isCorrect = /[*+✓]\s*[.;)]?\s*$/.test(trimmed);
  const text = trimmed.replace(/[*+✓]\s*([.;)]?)\s*$/, "$1").replace(/[*✓]/g, "").trim();
  return { text, isCorrect };
}

export async function parseQuestionsFromWord(buffer: Buffer): Promise<ParsedQuestion[]> {
  // First try to parse with direct XML extraction for underline detection
  try {
    const zip = new AdmZip(buffer);
    const docEntry = zip.getEntry("word/document.xml");
    if (docEntry) {
      const xmlContent = docEntry.getData().toString("utf8");
      const questionsFromXml = parseDocxXml(xmlContent);
      if (questionsFromXml.length > 0) {
        console.log("Parsed questions (XML with underline):", questionsFromXml.length);
        return questionsFromXml;
      }
    }
  } catch (e) {
    console.log("XML parsing failed, falling back to mammoth:", e);
  }
  
  // Fallback to mammoth HTML parsing
  const htmlResult = await mammoth.convertToHtml({ buffer });
  const numberedQuestionsWithFormatting = parseNumberedFormatWithUnderline(htmlResult.value);
  if (numberedQuestionsWithFormatting.length > 0) {
    console.log("Parsed questions (numbered format with underline):", numberedQuestionsWithFormatting.length);
    return numberedQuestionsWithFormatting;
  }
  
  const result = await mammoth.extractRawText({ buffer });
  let text = result.value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  
  const questions: ParsedQuestion[] = [];
  
  // Try new numbered format (1.1, 1.1.1, 1.1.2, etc.)
  const numberedQuestions = parseNumberedFormat(text);
  if (numberedQuestions.length > 0) {
    console.log("Parsed questions (numbered format):", numberedQuestions.length);
    return numberedQuestions;
  }
  
  // Fallback to old format (A) B) C) D))
  text = text.replace(/([A-D])\)/g, "\n$1)");
  text = text.replace(/(\d+)\./g, "\n$1.");
  
  const lines = text.split(/\n/).filter((line) => line.trim());
  let currentQuestion: { text: string; options: string[]; correctAnswer: number } | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    const questionMatch = trimmedLine.match(/^(\d+)[.\)]\s*(.+)/);
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

function parseNumberedFormatWithUnderline(html: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Remove HTML tags but preserve structure
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<strong>([^<]*)<\/strong>/gi, "___BOLD___$1___/BOLD___")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  
  const lines = text.split(/\n/).filter((line) => line.trim());
  
  let currentQuestion: { text: string; options: string[]; correctAnswer: number } | null = null;
  let questionNumberPrefix = "";
  let markerFound = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    const isBold = trimmedLine.includes("___BOLD___");
    const cleanLine = trimmedLine.replace(/___BOLD___|___\/BOLD___/g, "").trim();

    // Skip headers and section titles
    if (cleanLine.match(/^Раздел\s+/i)) continue;
    if (cleanLine.match(/^Программы тестирования/i)) continue;
    if (cleanLine.match(/^«Подготовка/i)) continue;
    if (cleanLine.match(/^эксперт\s*-\s*аудитор/i)) continue;
    if (cleanLine.match(/^ВНИМАНИЕ/i)) continue;
    if (cleanLine.match(/^Личностной опрос/i)) continue;
    if (cleanLine.length < 5) continue;

    // Match question format: 1.1, 1.2, 2.1 etc (bold text with number.number pattern)
    const questionMatch = cleanLine.match(/^(\d+\.\d+)\.?\s+(.+)/);

    // Match option format: 1.1.1, 1.1.2, 1.2.1.1, etc.
    const optionMatch = cleanLine.match(/^(\d+\.\d+\.\d+(?:\.\d+)?)\s*\.?\s*(?:Вариант:?\s*)?(.+)/i);

    if (optionMatch) {
      const optionNumber = optionMatch[1];
      let optionText = optionMatch[2].trim();
      optionText = optionText.replace(/^Вариант:?\s*/i, "").trim();
      const { text: cleanOption, isCorrect } = extractCorrectMarker(optionText);

      if (currentQuestion && cleanOption.length > 0) {
        const optionParts = optionNumber.split(".");
        const questionParts = questionNumberPrefix.split(".");

        if (optionParts[0] === questionParts[0] && optionParts[1] === questionParts[1]) {
          currentQuestion.options.push(cleanOption);
          if (isCorrect) {
            currentQuestion.correctAnswer = currentQuestion.options.length - 1;
            markerFound = true;
          } else if (!markerFound) {
            currentQuestion.correctAnswer = currentQuestion.options.length - 1;
          }
        }
      }
    } else if (questionMatch && isBold) {
      if (currentQuestion && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
      }

      questionNumberPrefix = questionMatch[1];
      markerFound = false;
      currentQuestion = {
        text: questionMatch[2].trim(),
        options: [],
        correctAnswer: 0,
      };
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.options.length >= 2) {
    questions.push(currentQuestion);
  }

  return questions;
}

function parseDocxXml(xml: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Extract paragraphs with their formatting
  const paragraphs: { text: string; isUnderlined: boolean; isBold: boolean }[] = [];
  
  // Match each paragraph <w:p>...</w:p>
  const pRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
  let pMatch;
  
  while ((pMatch = pRegex.exec(xml)) !== null) {
    const pContent = pMatch[1];
    let paragraphText = "";
    let hasUnderline = false;
    let hasBold = false;
    
    // Extract text runs <w:r>...</w:r>
    const rRegex = /<w:r[^>]*>([\s\S]*?)<\/w:r>/g;
    let rMatch;
    
    while ((rMatch = rRegex.exec(pContent)) !== null) {
      const runContent = rMatch[1];
      
      // Check for underline in run properties
      if (runContent.includes('w:u w:val="single"') || runContent.includes("w:u ")) {
        hasUnderline = true;
      }
      
      // Check for bold
      if (runContent.includes("<w:b/>") || runContent.includes("<w:b ")) {
        hasBold = true;
      }
      
      // Extract text
      const textMatch = runContent.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
      if (textMatch) {
        for (const t of textMatch) {
          const textContent = t.replace(/<w:t[^>]*>/, "").replace(/<\/w:t>/, "");
          paragraphText += textContent;
        }
      }
    }
    
    if (paragraphText.trim()) {
      paragraphs.push({
        text: paragraphText.trim(),
        isUnderlined: hasUnderline,
        isBold: hasBold,
      });
    }
  }
  
  // Now parse paragraphs into questions
  let currentQuestion: { text: string; options: string[]; correctAnswer: number } | null = null;
  let questionNumberPrefix = "";
  
  for (const para of paragraphs) {
    const cleanText = para.text.trim();
    
    // Skip headers
    if (cleanText.match(/^Раздел\s+/i)) continue;
    if (cleanText.match(/^Программы тестирования/i)) continue;
    if (cleanText.match(/^«Подготовка/i)) continue;
    if (cleanText.match(/^эксперт\s*-\s*аудитор/i)) continue;
    if (cleanText.match(/^ВНИМАНИЕ/i)) continue;
    if (cleanText.length < 5) continue;
    
    // Match question format: 1.1, 1.2, 2.1 etc
    const questionMatch = cleanText.match(/^(\d+\.\d+)\.?\s+(.+)/);
    
    // Match option format: 1.1.1, 1.1.2, 1.2.1.1, etc.
    const optionMatch = cleanText.match(/^(\d+\.\d+\.\d+(?:\.\d+)?)\s*\.?\s*(?:Вариант:?\s*)?(.+)/i);
    
    if (optionMatch) {
      const optionNumber = optionMatch[1];
      let optionText = optionMatch[2].trim();
      optionText = optionText.replace(/^Вариант:?\s*/i, "").trim();
      
      const { text: cleanOption, isCorrect: markedCorrect } = extractCorrectMarker(optionText);

      if (currentQuestion && cleanOption.length > 0) {
        const optionParts = optionNumber.split(".");
        const questionParts = questionNumberPrefix.split(".");

        if (optionParts[0] === questionParts[0] && optionParts[1] === questionParts[1]) {
          currentQuestion.options.push(cleanOption);

          // Correct if underlined OR flagged with a *, +, ✓ marker
          if (para.isUnderlined || markedCorrect) {
            currentQuestion.correctAnswer = currentQuestion.options.length - 1;
          }
        }
      }
    } else if (questionMatch && para.isBold) {
      if (currentQuestion && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
      }
      
      questionNumberPrefix = questionMatch[1];
      currentQuestion = {
        text: questionMatch[2].trim(),
        options: [],
        correctAnswer: 0,
      };
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentQuestion.options.length >= 2) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

function parseNumberedFormat(text: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const lines = text.split(/\n/).filter((line) => line.trim());
  
  let currentQuestion: { text: string; options: string[]; correctAnswer: number } | null = null;
  let questionNumberPrefix = "";
  let markerFound = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip section headers (like "1. Раздел...")
    const sectionMatch = trimmedLine.match(/^(\d+)\.\s+Раздел\s+/i);
    if (sectionMatch) continue;

    // Match question format: 1.1 or 1.2 (two numbers with dot)
    const questionMatch = trimmedLine.match(/^(\d+\.\d+)\.?\s+(.+)/);

    // Match option format: 1.1.1, 1.1.2, 1.2.1.1, etc. (three or more numbers)
    const optionMatch = trimmedLine.match(/^(\d+\.\d+\.\d+(?:\.\d+)?)\s*\.?\s*(?:Вариант:?\s*)?(.+)/i);

    if (optionMatch) {
      const optionNumber = optionMatch[1];
      let optionText = optionMatch[2].trim();

      // Remove "Вариант" prefix if present
      optionText = optionText.replace(/^Вариант:?\s*/i, "").trim();
      const { text: cleanOption, isCorrect } = extractCorrectMarker(optionText);

      // Check if this option belongs to current question
      if (currentQuestion && cleanOption.length > 0 && optionNumber.startsWith(questionNumberPrefix + ".")) {
        currentQuestion.options.push(cleanOption);
        if (isCorrect) {
          // Explicit marker (*, +, ✓) wins over positional guess
          currentQuestion.correctAnswer = currentQuestion.options.length - 1;
          markerFound = true;
        } else if (!markerFound) {
          // No marker yet: fall back to "last option is correct"
          currentQuestion.correctAnswer = currentQuestion.options.length - 1;
        }
      }
    } else if (questionMatch) {
      // Save previous question if valid
      if (currentQuestion && currentQuestion.options.length >= 2) {
        questions.push(currentQuestion);
      }

      questionNumberPrefix = questionMatch[1];
      markerFound = false;
      currentQuestion = {
        text: questionMatch[2].trim(),
        options: [],
        correctAnswer: 0,
      };
    }
  }

  // Don't forget the last question
  if (currentQuestion && currentQuestion.options.length >= 2) {
    questions.push(currentQuestion);
  }

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
