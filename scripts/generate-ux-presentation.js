import pptxgen from "pptxgenjs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pptx = new pptxgen();
const screenshotsDir = path.join(__dirname, "..", "screenshots");

pptx.layout = "LAYOUT_16x9";
pptx.title = "Платформа тестирования";
pptx.author = "Test Platform";

const COLORS = {
  primary: "2563EB",
  text: "1E293B",
  textLight: "64748B",
  white: "FFFFFF",
  bgLight: "F8FAFC",
  green: "10B981",
  blue: "3B82F6",
};

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.primary } });
slide1.addText("Платформа тестирования", { x: 0.5, y: 2.2, w: "90%", h: 1.2, fontSize: 48, bold: true, color: COLORS.white, align: "center" });
slide1.addText("Удобная система онлайн-тестирования\nдля организаций", { x: 0.5, y: 3.5, w: "90%", h: 1, fontSize: 24, color: COLORS.white, align: "center" });

// Slide 2: Для кого
let slide2 = pptx.addSlide();
slide2.addText("Для кого эта платформа?", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
const audiences = [
  { icon: "🏢", title: "Организации", desc: "Проводите аттестации и проверки знаний сотрудников" },
  { icon: "🎓", title: "Учебные центры", desc: "Тестируйте студентов с автоматической проверкой" },
  { icon: "📋", title: "HR-отделы", desc: "Оценивайте кандидатов при приеме на работу" },
];
audiences.forEach((item, i) => {
  slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + i * 3.2, y: 1.3, w: 3, h: 3.5, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide2.addText(item.icon, { x: 0.5 + i * 3.2, y: 1.6, w: 3, fontSize: 48, align: "center" });
  slide2.addText(item.title, { x: 0.5 + i * 3.2, y: 2.8, w: 3, fontSize: 18, bold: true, align: "center", color: COLORS.text });
  slide2.addText(item.desc, { x: 0.6 + i * 3.2, y: 3.4, w: 2.8, fontSize: 12, align: "center", color: COLORS.textLight });
});

// Slide 3: Путь пользователя
let slide3 = pptx.addSlide();
slide3.addText("Путь пользователя", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
const steps = [
  { num: "1", title: "Вход", desc: "Email + ИИН + ФИО" },
  { num: "2", title: "Ожидание", desc: "До назначенного времени" },
  { num: "3", title: "Тестирование", desc: "Ответы на вопросы" },
  { num: "4", title: "Результат", desc: "Подтверждение сдачи" },
];
steps.forEach((step, i) => {
  slide3.addShape(pptx.shapes.OVAL, { x: 0.8 + i * 2.4, y: 1.5, w: 1.2, h: 1.2, fill: { color: COLORS.primary } });
  slide3.addText(step.num, { x: 0.8 + i * 2.4, y: 1.75, w: 1.2, fontSize: 32, bold: true, color: COLORS.white, align: "center" });
  slide3.addText(step.title, { x: 0.3 + i * 2.4, y: 2.9, w: 2.2, fontSize: 16, bold: true, align: "center", color: COLORS.text });
  slide3.addText(step.desc, { x: 0.3 + i * 2.4, y: 3.4, w: 2.2, fontSize: 12, align: "center", color: COLORS.textLight });
  if (i < 3) {
    slide3.addShape(pptx.shapes.RIGHT_ARROW, { x: 2.1 + i * 2.4, y: 1.85, w: 0.5, h: 0.5, fill: { color: COLORS.textLight } });
  }
});
slide3.addImage({ path: path.join(screenshotsDir, "02-login.png"), x: 0.5, y: 4, w: 2.2, h: 1.375 });
slide3.addImage({ path: path.join(screenshotsDir, "06-waiting.png"), x: 2.9, y: 4, w: 2.2, h: 1.375 });
slide3.addImage({ path: path.join(screenshotsDir, "04-test-page.png"), x: 5.3, y: 4, w: 2.2, h: 1.375 });
slide3.addImage({ path: path.join(screenshotsDir, "05-test-result.png"), x: 7.7, y: 4, w: 2.2, h: 1.375 });

// Slide 4: Простая авторизация
let slide4 = pptx.addSlide();
slide4.addText("Простая авторизация", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide4.addImage({ path: path.join(screenshotsDir, "02-login.png"), x: 0.5, y: 1, w: 5, h: 3.125 });
slide4.addText([
  { text: "Что нужно для входа:\n\n", options: { bold: true, fontSize: 18 } },
  { text: "📧  Email адрес\n\n", options: { fontSize: 16 } },
  { text: "🔢  ИИН (12 цифр)\n\n", options: { fontSize: 16 } },
  { text: "👤  Имя и Фамилия\n\n", options: { fontSize: 16 } },
  { text: "Никаких паролей — безопасная\nидентификация по данным", options: { fontSize: 14, color: COLORS.textLight } },
], { x: 5.8, y: 1.2, w: 4, h: 3.5, color: COLORS.text, valign: "top" });

// Slide 5: Удобное тестирование
let slide5 = pptx.addSlide();
slide5.addText("Удобное тестирование", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide5.addImage({ path: path.join(screenshotsDir, "04-test-page.png"), x: 0.5, y: 1, w: 5.5, h: 3.4375 });
slide5.addText([
  { text: "Интуитивный интерфейс:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "✓ Прогресс-бар показывает сколько осталось\n\n", options: { fontSize: 14 } },
  { text: "✓ Навигация по номерам вопросов\n\n", options: { fontSize: 14 } },
  { text: "✓ Цветовая индикация отвеченных\n\n", options: { fontSize: 14 } },
  { text: "✓ Кнопки Назад/Далее для удобства\n\n", options: { fontSize: 14 } },
  { text: "✓ Автосохранение ответов\n\n", options: { fontSize: 14 } },
], { x: 6.2, y: 1, w: 3.6, h: 4, color: COLORS.text, valign: "top" });

// Slide 6: Завершение теста (placeholder for user image 4)
let slide6 = pptx.addSlide();
slide6.addText("Завершение тестирования", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 2, y: 1, w: 6, h: 4, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2, dashType: "dash" } });
slide6.addText("📷\n\nВставьте скриншот\n\"Тестирование пройдено\"", { x: 2, y: 2, w: 6, h: 2, fontSize: 16, color: COLORS.textLight, align: "center", valign: "middle" });
slide6.addText([
  { text: "После завершения теста пользователь видит:\n\n", options: { fontSize: 14 } },
  { text: "• Подтверждение успешной сдачи\n", options: { fontSize: 14 } },
  { text: "• Информацию о получении результатов\n", options: { fontSize: 14 } },
  { text: "• Кнопку выхода из системы", options: { fontSize: 14 } },
], { x: 0.5, y: 5.2, w: 9, h: 1, color: COLORS.text });

// Slide 7: Админ-панель обзор (placeholder for user image 3)
let slide7 = pptx.addSlide();
slide7.addText("Админ-панель: Обзор", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1, w: 9, h: 4.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2, dashType: "dash" } });
slide7.addText("📷\n\nВставьте скриншот Dashboard\n(с активными тестами и статистикой)", { x: 0.5, y: 2, w: 9, h: 2, fontSize: 16, color: COLORS.textLight, align: "center", valign: "middle" });
slide7.addText("Real-time мониторинг • Статистика • Экспорт результатов • Настройки теста", { x: 0.5, y: 5.3, w: 9, h: 0.5, fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 8: Мониторинг в реальном времени
let slide8 = pptx.addSlide();
slide8.addText("Мониторинг в реальном времени", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide8.addText([
  { text: "Администратор видит:\n\n", options: { bold: true, fontSize: 18 } },
  { text: "👥  Кто сейчас проходит тест\n\n", options: { fontSize: 16 } },
  { text: "📊  Прогресс каждого участника\n\n", options: { fontSize: 16 } },
  { text: "⏱️  Время начала тестирования\n\n", options: { fontSize: 16 } },
  { text: "✅  Завершенные тесты с результатами\n\n", options: { fontSize: 16 } },
  { text: "📜  Возможность выдать сертификат\n", options: { fontSize: 16 } },
], { x: 0.5, y: 1.2, w: 5, h: 4, color: COLORS.text, valign: "top" });
slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1, w: 4.3, h: 4.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.green, width: 2 } });
slide8.addText("🟢 Real-time\n\nОбновление данных\nв реальном времени\nбез перезагрузки", { x: 5.5, y: 1.5, w: 4.3, h: 3, fontSize: 16, color: COLORS.text, align: "center", valign: "middle" });

// Slide 9: Управление вопросами (placeholder for user image 2)
let slide9 = pptx.addSlide();
slide9.addText("Управление вопросами", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1, w: 9, h: 4.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2, dashType: "dash" } });
slide9.addText("📷\n\nВставьте скриншот вкладки \"Вопросы\"\n(импорт из Word + список вопросов)", { x: 0.5, y: 2, w: 9, h: 2, fontSize: 16, color: COLORS.textLight, align: "center", valign: "middle" });
slide9.addText("Импорт из Word • Просмотр вопросов • Правильные ответы • Удаление", { x: 0.5, y: 5.3, w: 9, h: 0.5, fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 10: Импорт вопросов
let slide10 = pptx.addSlide();
slide10.addText("Простой импорт вопросов", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide10.addText([
  { text: "Загрузите Word документ с вопросами:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "Поддерживаемые форматы:\n\n", options: { fontSize: 14, color: COLORS.textLight } },
  { text: "Нумерованный (1.1, 1.1.1):\n", options: { bold: true, fontSize: 14 } },
  { text: "1.1 Текст вопроса\n1.1.1 Вариант A\n1.1.2 Вариант B ✓\n1.1.3 Вариант C\n\n", options: { fontSize: 12, fontFace: "Courier New" } },
  { text: "Буквенный (A, B, C, D):\n", options: { bold: true, fontSize: 14 } },
  { text: "1. Текст вопроса\nA) Вариант A\nB) Вариант B ✓\nC) Вариант C\nD) Вариант D", options: { fontSize: 12, fontFace: "Courier New" } },
], { x: 0.5, y: 1.1, w: 5, h: 4.5, color: COLORS.text, valign: "top" });
slide10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1.1, w: 4.3, h: 2.5, fill: { color: COLORS.bgLight }, line: { color: COLORS.blue, width: 2 } });
slide10.addText("📄 → 📥\n\nПросто перетащите\nWord файл", { x: 5.5, y: 1.5, w: 4.3, h: 2, fontSize: 18, color: COLORS.text, align: "center", valign: "middle" });
slide10.addText([
  { text: "✓ Автоматическое распознавание\n", options: { fontSize: 14 } },
  { text: "✓ Определение правильных ответов\n", options: { fontSize: 14 } },
  { text: "✓ Мгновенная загрузка", options: { fontSize: 14 } },
], { x: 5.5, y: 3.8, w: 4.3, h: 1.5, color: COLORS.text });

// Slide 11: Управление пользователями (placeholder for user image 1)
let slide11 = pptx.addSlide();
slide11.addText("Управление пользователями", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide11.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 1, w: 9, h: 4.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2, dashType: "dash" } });
slide11.addText("📷\n\nВставьте скриншот вкладки \"Пользователи\"\n(импорт + список с временными окнами)", { x: 0.5, y: 2, w: 9, h: 2, fontSize: 16, color: COLORS.textLight, align: "center", valign: "middle" });
slide11.addText("Импорт из файла • Временные окна • Статусы • Управление доступом", { x: 0.5, y: 5.3, w: 9, h: 0.5, fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 12: Временные окна
let slide12 = pptx.addSlide();
slide12.addText("Гибкое расписание", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
slide12.addText([
  { text: "Для каждого пользователя можно задать:\n\n", options: { bold: true, fontSize: 18 } },
  { text: "🕐  Время начала тестирования\n\n", options: { fontSize: 16 } },
  { text: "🕐  Время окончания тестирования\n\n", options: { fontSize: 16 } },
  { text: "Пользователь не сможет:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "❌  Начать тест раньше времени\n\n", options: { fontSize: 14 } },
  { text: "❌  Продолжить после окончания\n\n", options: { fontSize: 14 } },
  { text: "❌  Пройти тест повторно", options: { fontSize: 14 } },
], { x: 0.5, y: 1.1, w: 5, h: 4.5, color: COLORS.text, valign: "top" });
slide12.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1.1, w: 4.3, h: 4, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2 } });
slide12.addText("Пример:\n\n👤 Иванов Иван\n\n📅 Начало: 03.04.2026, 10:00\n📅 Конец: 03.04.2026, 12:00\n\n⏱️ 2 часа на тест", { x: 5.7, y: 1.4, w: 3.9, h: 3.5, fontSize: 14, color: COLORS.text, valign: "top" });

// Slide 13: Экспорт и сертификаты
let slide13 = pptx.addSlide();
slide13.addText("Результаты и сертификаты", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
const exports = [
  { icon: "📊", title: "Экспорт CSV", desc: "Для Excel и анализа" },
  { icon: "📋", title: "Экспорт JSON", desc: "Для интеграций" },
  { icon: "📜", title: "Сертификаты", desc: "PDF для участников" },
];
exports.forEach((item, i) => {
  slide13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + i * 3.2, y: 1.3, w: 3, h: 2.8, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide13.addText(item.icon, { x: 0.5 + i * 3.2, y: 1.6, w: 3, fontSize: 40, align: "center" });
  slide13.addText(item.title, { x: 0.5 + i * 3.2, y: 2.6, w: 3, fontSize: 16, bold: true, align: "center", color: COLORS.text });
  slide13.addText(item.desc, { x: 0.6 + i * 3.2, y: 3.1, w: 2.8, fontSize: 12, align: "center", color: COLORS.textLight });
});
slide13.addText([
  { text: "Все результаты сохраняются и доступны для:\n\n", options: { fontSize: 14 } },
  { text: "• Анализа успеваемости\n", options: { fontSize: 14 } },
  { text: "• Отчетности руководству\n", options: { fontSize: 14 } },
  { text: "• Выдачи сертификатов участникам", options: { fontSize: 14 } },
], { x: 0.5, y: 4.4, w: 9, h: 1.5, color: COLORS.text });

// Slide 14: Преимущества
let slide14 = pptx.addSlide();
slide14.addText("Почему выбирают нас?", { x: 0.5, y: 0.3, w: "90%", fontSize: 36, bold: true, color: COLORS.text });
const benefits = [
  { icon: "⚡", title: "Быстрый старт", desc: "Загрузите вопросы и пользователей — готово!" },
  { icon: "👁️", title: "Real-time", desc: "Следите за тестами в реальном времени" },
  { icon: "🔒", title: "Безопасность", desc: "Защита от повторного прохождения" },
  { icon: "📱", title: "Удобство", desc: "Интуитивный интерфейс для всех" },
  { icon: "⏰", title: "Контроль", desc: "Гибкие временные окна" },
  { icon: "📊", title: "Аналитика", desc: "Экспорт и отчеты" },
];
benefits.forEach((item, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  slide14.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + col * 3.2, y: 1.2 + row * 2.3, w: 3, h: 2, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide14.addText(item.icon, { x: 0.5 + col * 3.2, y: 1.4 + row * 2.3, w: 3, fontSize: 28, align: "center" });
  slide14.addText(item.title, { x: 0.5 + col * 3.2, y: 2.1 + row * 2.3, w: 3, fontSize: 14, bold: true, align: "center", color: COLORS.text });
  slide14.addText(item.desc, { x: 0.6 + col * 3.2, y: 2.5 + row * 2.3, w: 2.8, fontSize: 11, align: "center", color: COLORS.textLight });
});

// Slide 15: Final
let slide15 = pptx.addSlide();
slide15.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.primary } });
slide15.addText("Платформа тестирования", { x: 0.5, y: 2, w: "90%", fontSize: 44, bold: true, color: COLORS.white, align: "center" });
slide15.addText("Простое и удобное решение\nдля онлайн-тестирования", { x: 0.5, y: 3.3, w: "90%", fontSize: 24, color: COLORS.white, align: "center" });
slide15.addText("Спасибо за внимание!", { x: 0.5, y: 4.8, w: "90%", fontSize: 20, color: COLORS.white, align: "center" });

pptx.writeFile({ fileName: "test-platform-ux-presentation.pptx" }).then(() => {
  console.log("✅ Презентация создана: test-platform-ux-presentation.pptx");
  console.log("\n⚠️  Замените placeholder-слайды (6, 7, 9, 11) на ваши скриншоты!");
});
