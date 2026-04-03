const pptxgen = require("pptxgenjs");

const pptx = new pptxgen();

pptx.layout = "LAYOUT_16x9";
pptx.title = "Платформа тестирования";
pptx.author = "Test Platform";

const COLORS = {
  primary: "2563EB",
  secondary: "1E40AF",
  accent: "3B82F6",
  success: "10B981",
  warning: "F59E0B",
  text: "1E293B",
  textLight: "64748B",
  white: "FFFFFF",
  bgLight: "F8FAFC",
};

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addShape(pptx.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: "100%",
  h: "100%",
  fill: { type: "solid", color: COLORS.primary },
});
slide1.addText("Платформа тестирования", {
  x: 0.5,
  y: 2,
  w: "90%",
  h: 1.5,
  fontSize: 44,
  bold: true,
  color: COLORS.white,
  align: "center",
});
slide1.addText("Система онлайн тестирования с админ-панелью", {
  x: 0.5,
  y: 3.5,
  w: "90%",
  h: 0.8,
  fontSize: 24,
  color: COLORS.white,
  align: "center",
});
slide1.addText("Next.js 16 • React 19 • Firebase • TailwindCSS", {
  x: 0.5,
  y: 4.8,
  w: "90%",
  h: 0.5,
  fontSize: 16,
  color: COLORS.white,
  align: "center",
});

// Slide 2: Overview
let slide2 = pptx.addSlide();
slide2.addText("Обзор проекта", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});
slide2.addText(
  [
    { text: "Цель проекта:\n", options: { bold: true, fontSize: 18 } },
    {
      text: "Создание современной платформы для проведения онлайн-тестирования с возможностью управления вопросами, пользователями и мониторинга результатов в реальном времени.\n\n",
      options: { fontSize: 16 },
    },
    { text: "Основные возможности:\n", options: { bold: true, fontSize: 18 } },
    { text: "• Авторизация пользователей по Email, ИИН, ФИО\n", options: { fontSize: 16 } },
    { text: "• Прохождение тестов с сохранением прогресса\n", options: { fontSize: 16 } },
    { text: "• Админ-панель с real-time мониторингом\n", options: { fontSize: 16 } },
    { text: "• Импорт вопросов из Word документов\n", options: { fontSize: 16 } },
    { text: "• Управление временными окнами тестирования\n", options: { fontSize: 16 } },
    { text: "• Экспорт результатов в CSV/JSON\n", options: { fontSize: 16 } },
    { text: "• Генерация сертификатов\n", options: { fontSize: 16 } },
  ],
  {
    x: 0.5,
    y: 1.2,
    w: "90%",
    h: 4,
    color: COLORS.text,
    valign: "top",
  }
);

// Slide 3: Tech Stack
let slide3 = pptx.addSlide();
slide3.addText("Технологический стек", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});

const techStack = [
  { name: "Next.js 16", desc: "React фреймворк с SSR и API routes" },
  { name: "React 19", desc: "UI библиотека с новым компилятором" },
  { name: "TypeScript", desc: "Типизация для надежности кода" },
  { name: "Firebase", desc: "Realtime Database + Authentication" },
  { name: "TailwindCSS 4", desc: "Utility-first CSS фреймворк" },
  { name: "Zod", desc: "Валидация данных на сервере" },
];

techStack.forEach((tech, i) => {
  const row = Math.floor(i / 2);
  const col = i % 2;
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5 + col * 4.8,
    y: 1.2 + row * 1.5,
    w: 4.5,
    h: 1.2,
    fill: { color: COLORS.bgLight },
    line: { color: COLORS.accent, width: 1 },
  });
  slide3.addText(tech.name, {
    x: 0.7 + col * 4.8,
    y: 1.35 + row * 1.5,
    w: 4.1,
    fontSize: 16,
    bold: true,
    color: COLORS.primary,
  });
  slide3.addText(tech.desc, {
    x: 0.7 + col * 4.8,
    y: 1.75 + row * 1.5,
    w: 4.1,
    fontSize: 12,
    color: COLORS.textLight,
  });
});

// Slide 4: Architecture
let slide4 = pptx.addSlide();
slide4.addText("Архитектура приложения", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});
slide4.addText(
  [
    { text: "Структура проекта:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "src/\n", options: { bold: true, fontSize: 14, fontFace: "Courier New" } },
    { text: "├── app/              ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# Next.js App Router\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "│   ├── page.tsx      ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# Главная страница\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "│   ├── login/        ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# Страница авторизации\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "│   ├── test/         ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# Страница тестирования\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "│   ├── admin/        ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# Админ-панель\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "│   └── api/          ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# API endpoints\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "├── components/       ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# UI компоненты\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "├── lib/              ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# Утилиты и Firebase\n", options: { fontSize: 12, color: COLORS.textLight } },
    { text: "└── middleware.ts     ", options: { fontSize: 14, fontFace: "Courier New" } },
    { text: "# Защита маршрутов\n", options: { fontSize: 12, color: COLORS.textLight } },
  ],
  {
    x: 0.5,
    y: 1.1,
    w: "90%",
    h: 4.5,
    color: COLORS.text,
    valign: "top",
  }
);

// Slide 5: User Flow - Login
let slide5 = pptx.addSlide();
slide5.addText("Страница авторизации", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});
slide5.addText(
  [
    { text: "Функционал:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "• Ввод Email, ИИН (12 цифр), Имя и Фамилия\n", options: { fontSize: 16 } },
    { text: "• Валидация данных на клиенте и сервере\n", options: { fontSize: 16 } },
    { text: "• JWT токен для сессии\n", options: { fontSize: 16 } },
    { text: "• Автоматическое перенаправление:\n", options: { fontSize: 16 } },
    { text: "  - Админы → /admin\n", options: { fontSize: 14, color: COLORS.textLight } },
    { text: "  - Пользователи → /test\n\n", options: { fontSize: 14, color: COLORS.textLight } },
    { text: "Безопасность:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "• Middleware защищает маршруты\n", options: { fontSize: 16 } },
    { text: "• Проверка роли пользователя\n", options: { fontSize: 16 } },
    { text: "• HttpOnly cookies для токенов\n", options: { fontSize: 16 } },
  ],
  {
    x: 0.5,
    y: 1.1,
    w: "90%",
    h: 4,
    color: COLORS.text,
    valign: "top",
  }
);

// Slide 6: Test Page
let slide6 = pptx.addSlide();
slide6.addText("Страница тестирования", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});
slide6.addText(
  [
    { text: "Интерфейс теста:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "• Прогресс-бар с количеством отвеченных вопросов\n", options: { fontSize: 16 } },
    { text: "• Навигация по номерам вопросов\n", options: { fontSize: 16 } },
    { text: "• Выбор варианта ответа (A, B, C, D)\n", options: { fontSize: 16 } },
    { text: "• Кнопки Назад/Далее/Завершить\n\n", options: { fontSize: 16 } },
    { text: "Состояния:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "• Ожидание начала (если тест запланирован)\n", options: { fontSize: 16 } },
    { text: "• Время не назначено\n", options: { fontSize: 16 } },
    { text: "• Время истекло\n", options: { fontSize: 16 } },
    { text: "• Тест уже пройден\n", options: { fontSize: 16 } },
    { text: "• Результат после завершения\n", options: { fontSize: 16 } },
  ],
  {
    x: 0.5,
    y: 1.1,
    w: "90%",
    h: 4.5,
    color: COLORS.text,
    valign: "top",
  }
);

// Slide 7: Admin Panel
let slide7 = pptx.addSlide();
slide7.addText("Админ-панель: Dashboard", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});

const adminFeatures = [
  { icon: "📊", title: "Статистика", desc: "Вопросы, пользователи, тесты" },
  { icon: "⚡", title: "Real-time", desc: "Активные тесты в реальном времени" },
  { icon: "✅", title: "Результаты", desc: "Завершенные тесты с процентами" },
  { icon: "📥", title: "Экспорт", desc: "CSV и JSON форматы" },
];

adminFeatures.forEach((feat, i) => {
  slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5 + i * 2.4,
    y: 1.3,
    w: 2.2,
    h: 2,
    fill: { color: COLORS.bgLight },
    line: { color: COLORS.accent, width: 1 },
  });
  slide7.addText(feat.icon, {
    x: 0.5 + i * 2.4,
    y: 1.5,
    w: 2.2,
    fontSize: 28,
    align: "center",
  });
  slide7.addText(feat.title, {
    x: 0.5 + i * 2.4,
    y: 2.3,
    w: 2.2,
    fontSize: 14,
    bold: true,
    align: "center",
    color: COLORS.text,
  });
  slide7.addText(feat.desc, {
    x: 0.5 + i * 2.4,
    y: 2.7,
    w: 2.2,
    fontSize: 11,
    align: "center",
    color: COLORS.textLight,
  });
});

slide7.addText(
  [
    { text: "\nНастройки теста:\n", options: { bold: true, fontSize: 16 } },
    { text: "• Выбор количества вопросов (5-100)\n", options: { fontSize: 14 } },
    { text: "• Автоматическая выборка из базы\n", options: { fontSize: 14 } },
  ],
  {
    x: 0.5,
    y: 3.5,
    w: "90%",
    color: COLORS.text,
  }
);

// Slide 8: Admin - Questions
let slide8 = pptx.addSlide();
slide8.addText("Админ-панель: Вопросы", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});
slide8.addText(
  [
    { text: "Импорт из Word:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "Поддерживаются 2 формата:\n\n", options: { fontSize: 16 } },
    { text: "Формат 1 - Нумерованный:\n", options: { bold: true, fontSize: 14 } },
    { text: "1.1 Текст вопроса\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "1.1.1 Вариант A\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "1.1.2 Вариант B\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "1.1.3 Вариант C\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "1.1.4 Правильный ответ\n\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "Формат 2 - Буквенный:\n", options: { bold: true, fontSize: 14 } },
    { text: "1. Текст вопроса?\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "A) Вариант\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "B) Правильный *\n", options: { fontSize: 12, fontFace: "Courier New" } },
    { text: "C) Вариант\n", options: { fontSize: 12, fontFace: "Courier New" } },
  ],
  {
    x: 0.5,
    y: 1.1,
    w: 5,
    h: 4.5,
    color: COLORS.text,
    valign: "top",
  }
);
slide8.addText(
  [
    { text: "Управление:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "• Просмотр всех вопросов\n", options: { fontSize: 16 } },
    { text: "• Удаление отдельных вопросов\n", options: { fontSize: 16 } },
    { text: "• Удаление всех вопросов\n", options: { fontSize: 16 } },
    { text: "• Поиск по тексту\n", options: { fontSize: 16 } },
  ],
  {
    x: 5.5,
    y: 1.1,
    w: 4.5,
    h: 4,
    color: COLORS.text,
    valign: "top",
  }
);

// Slide 9: Admin - Users
let slide9 = pptx.addSlide();
slide9.addText("Админ-панель: Пользователи", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});
slide9.addText(
  [
    { text: "Управление пользователями:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "• Импорт из Excel файла\n", options: { fontSize: 16 } },
    { text: "• Просмотр списка пользователей\n", options: { fontSize: 16 } },
    { text: "• Удаление пользователей\n\n", options: { fontSize: 16 } },
    { text: "Временные окна:\n\n", options: { bold: true, fontSize: 18 } },
    { text: "• Назначение времени начала теста\n", options: { fontSize: 16 } },
    { text: "• Назначение времени окончания\n", options: { fontSize: 16 } },
    { text: "• Пользователь не может начать тест до назначенного времени\n", options: { fontSize: 16 } },
    { text: "• После истечения времени тест недоступен\n", options: { fontSize: 16 } },
  ],
  {
    x: 0.5,
    y: 1.1,
    w: "90%",
    h: 4,
    color: COLORS.text,
    valign: "top",
  }
);

// Slide 10: API Structure
let slide10 = pptx.addSlide();
slide10.addText("API Endpoints", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});

const apis = [
  { group: "Auth", endpoints: ["POST /api/auth/login", "POST /api/auth/logout"] },
  { group: "Test", endpoints: ["POST /api/test/start", "POST /api/test/answer", "POST /api/test/submit"] },
  { group: "Admin", endpoints: ["GET/POST /api/admin/questions", "GET/PUT/DELETE /api/admin/users", "POST /api/admin/import-questions", "GET /api/admin/export", "GET /api/admin/certificate"] },
];

let yPos = 1.2;
apis.forEach((api) => {
  slide10.addText(api.group, {
    x: 0.5,
    y: yPos,
    w: 2,
    fontSize: 16,
    bold: true,
    color: COLORS.primary,
  });
  api.endpoints.forEach((ep, i) => {
    slide10.addText(ep, {
      x: 2.5,
      y: yPos + i * 0.4,
      w: 7,
      fontSize: 12,
      fontFace: "Courier New",
      color: COLORS.text,
    });
  });
  yPos += api.endpoints.length * 0.4 + 0.5;
});

// Slide 11: Security
let slide11 = pptx.addSlide();
slide11.addText("Безопасность", {
  x: 0.5,
  y: 0.3,
  w: "90%",
  fontSize: 32,
  bold: true,
  color: COLORS.text,
});
slide11.addText(
  [
    { text: "Аутентификация:\n", options: { bold: true, fontSize: 18 } },
    { text: "• JWT токены с jose библиотекой\n", options: { fontSize: 16 } },
    { text: "• HttpOnly cookies\n", options: { fontSize: 16 } },
    { text: "• Bcrypt для хеширования паролей\n\n", options: { fontSize: 16 } },
    { text: "Авторизация:\n", options: { bold: true, fontSize: 18 } },
    { text: "• Middleware проверяет токен на каждый запрос\n", options: { fontSize: 16 } },
    { text: "• Разделение ролей (admin/user)\n", options: { fontSize: 16 } },
    { text: "• Защита API endpoints\n\n", options: { fontSize: 16 } },
    { text: "Валидация:\n", options: { bold: true, fontSize: 18 } },
    { text: "• Zod схемы для валидации данных\n", options: { fontSize: 16 } },
    { text: "• Проверка ИИН (12 цифр)\n", options: { fontSize: 16 } },
    { text: "• Санитизация входных данных\n", options: { fontSize: 16 } },
  ],
  {
    x: 0.5,
    y: 1.1,
    w: "90%",
    h: 4.5,
    color: COLORS.text,
    valign: "top",
  }
);

// Slide 12: Summary
let slide12 = pptx.addSlide();
slide12.addShape(pptx.shapes.RECTANGLE, {
  x: 0,
  y: 0,
  w: "100%",
  h: "100%",
  fill: { type: "solid", color: COLORS.primary },
});
slide12.addText("Итоги", {
  x: 0.5,
  y: 1,
  w: "90%",
  fontSize: 40,
  bold: true,
  color: COLORS.white,
  align: "center",
});
slide12.addText(
  [
    { text: "✓ Современный стек технологий\n", options: { fontSize: 20 } },
    { text: "✓ Real-time мониторинг тестов\n", options: { fontSize: 20 } },
    { text: "✓ Гибкий импорт вопросов\n", options: { fontSize: 20 } },
    { text: "✓ Управление временными окнами\n", options: { fontSize: 20 } },
    { text: "✓ Безопасная авторизация\n", options: { fontSize: 20 } },
    { text: "✓ Экспорт результатов\n", options: { fontSize: 20 } },
  ],
  {
    x: 0.5,
    y: 2.2,
    w: "90%",
    h: 3,
    color: COLORS.white,
    align: "center",
    valign: "top",
  }
);

// Save
pptx.writeFile({ fileName: "test-platform-presentation.pptx" }).then(() => {
  console.log("Презентация создана: test-platform-presentation.pptx");
});
