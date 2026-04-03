const pptxgen = require("pptxgenjs");
const path = require("path");

const pptx = new pptxgen();
const screenshotsDir = path.join(__dirname, "..", "screenshots");

pptx.layout = "LAYOUT_16x9";
pptx.title = "Платформа тестирования";
pptx.author = "Test Platform";

const COLORS = {
  primary: "2563EB",
  secondary: "1E40AF",
  text: "1E293B",
  textLight: "64748B",
  white: "FFFFFF",
  bgLight: "F8FAFC",
};

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.primary } });
slide1.addText("Платформа тестирования", { x: 0.5, y: 2, w: "90%", h: 1.5, fontSize: 44, bold: true, color: COLORS.white, align: "center" });
slide1.addText("Система онлайн тестирования с админ-панелью", { x: 0.5, y: 3.5, w: "90%", h: 0.8, fontSize: 24, color: COLORS.white, align: "center" });
slide1.addText("Next.js 16 • React 19 • Firebase • TailwindCSS", { x: 0.5, y: 4.8, w: "90%", h: 0.5, fontSize: 16, color: COLORS.white, align: "center" });

// Slide 2: Overview
let slide2 = pptx.addSlide();
slide2.addText("Обзор проекта", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide2.addText([
  { text: "Цель проекта:\n", options: { bold: true, fontSize: 18 } },
  { text: "Создание современной платформы для проведения онлайн-тестирования с возможностью управления вопросами, пользователями и мониторинга результатов в реальном времени.\n\n", options: { fontSize: 16 } },
  { text: "Основные возможности:\n", options: { bold: true, fontSize: 18 } },
  { text: "• Авторизация пользователей по Email, ИИН, ФИО\n", options: { fontSize: 16 } },
  { text: "• Прохождение тестов с сохранением прогресса\n", options: { fontSize: 16 } },
  { text: "• Админ-панель с real-time мониторингом\n", options: { fontSize: 16 } },
  { text: "• Импорт вопросов из Word документов\n", options: { fontSize: 16 } },
  { text: "• Управление временными окнами тестирования\n", options: { fontSize: 16 } },
  { text: "• Экспорт результатов в CSV/JSON\n", options: { fontSize: 16 } },
], { x: 0.5, y: 1.2, w: "90%", h: 4, color: COLORS.text, valign: "top" });

// Slide 3: Tech Stack
let slide3 = pptx.addSlide();
slide3.addText("Технологический стек", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
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
  slide3.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + col * 4.8, y: 1.2 + row * 1.5, w: 4.5, h: 1.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide3.addText(tech.name, { x: 0.7 + col * 4.8, y: 1.35 + row * 1.5, w: 4.1, fontSize: 16, bold: true, color: COLORS.primary });
  slide3.addText(tech.desc, { x: 0.7 + col * 4.8, y: 1.75 + row * 1.5, w: 4.1, fontSize: 12, color: COLORS.textLight });
});

// Slide 4: Home page screenshot
let slide4 = pptx.addSlide();
slide4.addText("Главная страница", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide4.addImage({ path: path.join(screenshotsDir, "01-home.png"), x: 1.5, y: 1, w: 7, h: 4.375 });
slide4.addText("Приветственная страница с кнопкой входа в систему", { x: 0.5, y: 5.5, w: "90%", fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 5: Login page screenshot
let slide5 = pptx.addSlide();
slide5.addText("Страница авторизации", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide5.addImage({ path: path.join(screenshotsDir, "02-login.png"), x: 0.3, y: 1, w: 4.5, h: 2.8125 });
slide5.addImage({ path: path.join(screenshotsDir, "03-login-filled.png"), x: 5.2, y: 1, w: 4.5, h: 2.8125 });
slide5.addText([
  { text: "Функционал:\n", options: { bold: true, fontSize: 14 } },
  { text: "• Email, ИИН (12 цифр), Имя, Фамилия\n", options: { fontSize: 12 } },
  { text: "• Валидация на клиенте и сервере\n", options: { fontSize: 12 } },
  { text: "• JWT токен для сессии\n", options: { fontSize: 12 } },
  { text: "• Перенаправление по роли\n", options: { fontSize: 12 } },
], { x: 0.5, y: 4.2, w: 4.5, h: 1.5, color: COLORS.text, valign: "top" });
slide5.addText([
  { text: "Безопасность:\n", options: { bold: true, fontSize: 14 } },
  { text: "• Middleware защищает маршруты\n", options: { fontSize: 12 } },
  { text: "• HttpOnly cookies\n", options: { fontSize: 12 } },
  { text: "• Bcrypt хеширование\n", options: { fontSize: 12 } },
], { x: 5.2, y: 4.2, w: 4.5, h: 1.5, color: COLORS.text, valign: "top" });

// Slide 6: Test page screenshot
let slide6 = pptx.addSlide();
slide6.addText("Страница тестирования", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide6.addImage({ path: path.join(screenshotsDir, "04-test-page.png"), x: 1.5, y: 1, w: 7, h: 4.375 });
slide6.addText("Интерфейс прохождения теста с навигацией по вопросам и прогресс-баром", { x: 0.5, y: 5.5, w: "90%", fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 7: Test features
let slide7 = pptx.addSlide();
slide7.addText("Функционал тестирования", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide7.addImage({ path: path.join(screenshotsDir, "04-test-page.png"), x: 0.3, y: 1, w: 5, h: 3.125 });
slide7.addText([
  { text: "Интерфейс теста:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "• Прогресс-бар с количеством ответов\n", options: { fontSize: 14 } },
  { text: "• Навигация по номерам вопросов\n", options: { fontSize: 14 } },
  { text: "• Цветовая индикация статуса\n", options: { fontSize: 14 } },
  { text: "• Выбор варианта ответа (A-D)\n", options: { fontSize: 14 } },
  { text: "• Кнопки Назад/Далее/Завершить\n", options: { fontSize: 14 } },
  { text: "• Автосохранение ответов\n", options: { fontSize: 14 } },
], { x: 5.5, y: 1, w: 4.3, h: 3.5, color: COLORS.text, valign: "top" });
slide7.addImage({ path: path.join(screenshotsDir, "05-test-result.png"), x: 5.5, y: 3.5, w: 4, h: 2.5 });

// Slide 8: Waiting page
let slide8 = pptx.addSlide();
slide8.addText("Состояния тестирования", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide8.addImage({ path: path.join(screenshotsDir, "06-waiting.png"), x: 0.3, y: 1, w: 4.8, h: 3 });
slide8.addImage({ path: path.join(screenshotsDir, "05-test-result.png"), x: 5.2, y: 1, w: 4.8, h: 3 });
slide8.addText([
  { text: "Ожидание начала\n", options: { bold: true, fontSize: 14 } },
  { text: "Показывает запланированное время", options: { fontSize: 12 } },
], { x: 0.3, y: 4.2, w: 4.8, h: 1, color: COLORS.text, align: "center" });
slide8.addText([
  { text: "Завершение теста\n", options: { bold: true, fontSize: 14 } },
  { text: "Подтверждение успешной сдачи", options: { fontSize: 12 } },
], { x: 5.2, y: 4.2, w: 4.8, h: 1, color: COLORS.text, align: "center" });

// Slide 9: Admin Dashboard
let slide9 = pptx.addSlide();
slide9.addText("Админ-панель: Dashboard", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide9.addImage({ path: path.join(screenshotsDir, "07-admin-dashboard.png"), x: 1.5, y: 1, w: 7, h: 4.375 });
slide9.addText("Real-time мониторинг активных тестов, статистика и экспорт результатов", { x: 0.5, y: 5.5, w: "90%", fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 10: Admin features
let slide10 = pptx.addSlide();
slide10.addText("Функционал админ-панели", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
const adminFeatures = [
  { icon: "📊", title: "Статистика", desc: "Количество вопросов, пользователей, тестов" },
  { icon: "⚡", title: "Real-time", desc: "Мониторинг активных тестов в реальном времени" },
  { icon: "📥", title: "Импорт", desc: "Загрузка вопросов из Word, пользователей из Excel" },
  { icon: "📤", title: "Экспорт", desc: "Выгрузка результатов в CSV и JSON форматах" },
  { icon: "⏰", title: "Расписание", desc: "Управление временными окнами тестирования" },
  { icon: "📜", title: "Сертификаты", desc: "Генерация сертификатов для участников" },
];
adminFeatures.forEach((feat, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  slide10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.4 + col * 3.2, y: 1.2 + row * 2.2, w: 3, h: 1.8, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide10.addText(feat.icon, { x: 0.4 + col * 3.2, y: 1.4 + row * 2.2, w: 3, fontSize: 28, align: "center" });
  slide10.addText(feat.title, { x: 0.4 + col * 3.2, y: 2.1 + row * 2.2, w: 3, fontSize: 14, bold: true, align: "center", color: COLORS.text });
  slide10.addText(feat.desc, { x: 0.5 + col * 3.2, y: 2.5 + row * 2.2, w: 2.8, fontSize: 10, align: "center", color: COLORS.textLight });
});

// Slide 11: Architecture
let slide11 = pptx.addSlide();
slide11.addText("Архитектура приложения", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide11.addText([
  { text: "src/\n", options: { bold: true, fontSize: 14, fontFace: "Courier New" } },
  { text: "├── app/              ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# Next.js App Router\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "│   ├── page.tsx      ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# Главная\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "│   ├── login/        ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# Авторизация\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "│   ├── test/         ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# Тестирование\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "│   ├── admin/        ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# Админ-панель\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "│   └── api/          ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# API endpoints\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "├── components/       ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# UI компоненты\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "├── lib/              ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# Firebase, утилиты\n", options: { fontSize: 11, color: COLORS.textLight } },
  { text: "└── middleware.ts     ", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "# Защита маршрутов\n", options: { fontSize: 11, color: COLORS.textLight } },
], { x: 0.5, y: 1.1, w: 5, h: 4, color: COLORS.text, valign: "top" });
slide11.addText([
  { text: "API Endpoints:\n\n", options: { bold: true, fontSize: 14 } },
  { text: "Auth:\n", options: { bold: true, fontSize: 12, color: COLORS.primary } },
  { text: "POST /api/auth/login\nPOST /api/auth/logout\n\n", options: { fontSize: 11, fontFace: "Courier New" } },
  { text: "Test:\n", options: { bold: true, fontSize: 12, color: COLORS.primary } },
  { text: "POST /api/test/start\nPOST /api/test/answer\nPOST /api/test/submit\n\n", options: { fontSize: 11, fontFace: "Courier New" } },
  { text: "Admin:\n", options: { bold: true, fontSize: 12, color: COLORS.primary } },
  { text: "GET/POST /api/admin/questions\nGET/PUT/DELETE /api/admin/users\nPOST /api/admin/import-*\nGET /api/admin/export", options: { fontSize: 11, fontFace: "Courier New" } },
], { x: 5.5, y: 1.1, w: 4.3, h: 4.5, color: COLORS.text, valign: "top" });

// Slide 12: Summary
let slide12 = pptx.addSlide();
slide12.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.primary } });
slide12.addText("Итоги", { x: 0.5, y: 1, w: "90%", fontSize: 40, bold: true, color: COLORS.white, align: "center" });
slide12.addText([
  { text: "✓ Современный стек технологий\n", options: { fontSize: 20 } },
  { text: "✓ Real-time мониторинг тестов\n", options: { fontSize: 20 } },
  { text: "✓ Гибкий импорт вопросов из Word\n", options: { fontSize: 20 } },
  { text: "✓ Управление временными окнами\n", options: { fontSize: 20 } },
  { text: "✓ Безопасная авторизация (JWT)\n", options: { fontSize: 20 } },
  { text: "✓ Экспорт результатов CSV/JSON\n", options: { fontSize: 20 } },
  { text: "✓ Генерация сертификатов\n", options: { fontSize: 20 } },
], { x: 0.5, y: 2.2, w: "90%", h: 3.5, color: COLORS.white, align: "center", valign: "top" });

// Save
pptx.writeFile({ fileName: "test-platform-presentation-v2.pptx" }).then(() => {
  console.log("✅ Презентация создана: test-platform-presentation-v2.pptx");
});
