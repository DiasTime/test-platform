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
  bgLight: "F1F5F9",
  green: "10B981",
};

// Slide 1: Title
let slide1 = pptx.addSlide();
slide1.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.primary } });
slide1.addText("Платформа тестирования", { x: 0.5, y: 2.2, w: "90%", fontSize: 48, bold: true, color: COLORS.white, align: "center" });
slide1.addText("Удобная система онлайн-тестирования для организаций", { x: 0.5, y: 3.5, w: "90%", fontSize: 22, color: COLORS.white, align: "center" });

// Slide 2: Для кого
let slide2 = pptx.addSlide();
slide2.addText("Для кого эта платформа?", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
const audiences = [
  { icon: "🏢", title: "Организации", desc: "Аттестации и проверки знаний сотрудников" },
  { icon: "🎓", title: "Учебные центры", desc: "Тестирование студентов с автопроверкой" },
  { icon: "📋", title: "HR-отделы", desc: "Оценка кандидатов при приеме" },
];
audiences.forEach((item, i) => {
  slide2.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + i * 3.2, y: 1.2, w: 3, h: 3.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide2.addText(item.icon, { x: 0.5 + i * 3.2, y: 1.5, w: 3, fontSize: 44, align: "center" });
  slide2.addText(item.title, { x: 0.5 + i * 3.2, y: 2.6, w: 3, fontSize: 16, bold: true, align: "center", color: COLORS.text });
  slide2.addText(item.desc, { x: 0.6 + i * 3.2, y: 3.2, w: 2.8, fontSize: 12, align: "center", color: COLORS.textLight });
});
slide2.addText("Простое решение для проведения тестирований любого масштаба", { x: 0.5, y: 4.8, w: 9, fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 3: Путь пользователя
let slide3 = pptx.addSlide();
slide3.addText("Как проходит тестирование?", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
const steps = [
  { num: "1", title: "Вход в систему", desc: "Email + ИИН + ФИО" },
  { num: "2", title: "Ожидание", desc: "До назначенного времени" },
  { num: "3", title: "Тестирование", desc: "Ответы на вопросы" },
  { num: "4", title: "Результат", desc: "Подтверждение сдачи" },
];
steps.forEach((step, i) => {
  slide3.addShape(pptx.shapes.OVAL, { x: 0.7 + i * 2.4, y: 1.3, w: 1.1, h: 1.1, fill: { color: COLORS.primary } });
  slide3.addText(step.num, { x: 0.7 + i * 2.4, y: 1.5, w: 1.1, fontSize: 28, bold: true, color: COLORS.white, align: "center" });
  slide3.addText(step.title, { x: 0.2 + i * 2.4, y: 2.6, w: 2.1, fontSize: 14, bold: true, align: "center", color: COLORS.text });
  slide3.addText(step.desc, { x: 0.2 + i * 2.4, y: 3, w: 2.1, fontSize: 11, align: "center", color: COLORS.textLight });
  if (i < 3) {
    slide3.addText("→", { x: 1.9 + i * 2.4, y: 1.5, w: 0.5, fontSize: 24, color: COLORS.textLight, align: "center" });
  }
});
slide3.addText("Интуитивный процесс — пользователю не нужна инструкция", { x: 0.5, y: 4, w: 9, fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 4: Авторизация
let slide4 = pptx.addSlide();
slide4.addText("Простая авторизация", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide4.addImage({ path: path.join(screenshotsDir, "02-login.png"), x: 0.5, y: 1, w: 5, h: 3.125 });
slide4.addText([
  { text: "Что нужно для входа:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "📧  Email адрес\n\n", options: { fontSize: 15 } },
  { text: "🔢  ИИН (12 цифр)\n\n", options: { fontSize: 15 } },
  { text: "👤  Имя и Фамилия\n\n", options: { fontSize: 15 } },
  { text: "Никаких паролей!\nБезопасная идентификация по данным", options: { fontSize: 13, color: COLORS.textLight } },
], { x: 5.7, y: 1.2, w: 4, h: 3.5, color: COLORS.text, valign: "top" });

// Slide 5: Тестирование
let slide5 = pptx.addSlide();
slide5.addText("Удобный интерфейс теста", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide5.addImage({ path: path.join(screenshotsDir, "04-test-page.png"), x: 0.5, y: 1, w: 5.5, h: 3.4375 });
slide5.addText([
  { text: "Всё продумано:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "✓ Прогресс-бар сверху\n\n", options: { fontSize: 14 } },
  { text: "✓ Навигация по номерам\n\n", options: { fontSize: 14 } },
  { text: "✓ Цвета показывают статус\n\n", options: { fontSize: 14 } },
  { text: "✓ Кнопки Назад/Далее\n\n", options: { fontSize: 14 } },
  { text: "✓ Автосохранение ответов", options: { fontSize: 14 } },
], { x: 6.2, y: 1.2, w: 3.5, h: 3.5, color: COLORS.text, valign: "top" });

// Slide 6: Завершение - PLACEHOLDER
let slide6 = pptx.addSlide();
slide6.addText("Завершение тестирования", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide6.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 1.5, y: 0.9, w: 7, h: 4.3, fill: { color: COLORS.bgLight }, line: { color: COLORS.green, width: 2 } });
slide6.addText("📷\n\nВставьте скриншот\n\"Тестирование пройдено\"\n\n(Image 4)", { x: 1.5, y: 1.8, w: 7, h: 2.5, fontSize: 18, color: COLORS.textLight, align: "center", valign: "middle" });
slide6.addText("Пользователь получает подтверждение • Результаты сообщит администратор", { x: 0.5, y: 5.3, w: 9, fontSize: 13, color: COLORS.textLight, align: "center" });

// Slide 7: Админ Dashboard - PLACEHOLDER
let slide7 = pptx.addSlide();
slide7.addText("Админ-панель: Dashboard", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide7.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 4.3, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2 } });
slide7.addText("📷\n\nВставьте скриншот Dashboard\n(со статистикой и активными тестами)\n\n(Image 3)", { x: 0.3, y: 1.8, w: 9.4, h: 2.5, fontSize: 18, color: COLORS.textLight, align: "center", valign: "middle" });
slide7.addText("Статистика • Активные тесты в реальном времени • Завершенные тесты • Экспорт", { x: 0.5, y: 5.3, w: 9, fontSize: 13, color: COLORS.textLight, align: "center" });

// Slide 8: Real-time мониторинг
let slide8 = pptx.addSlide();
slide8.addText("Мониторинг в реальном времени", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide8.addText([
  { text: "Администратор видит:\n\n", options: { bold: true, fontSize: 18 } },
  { text: "👥  Кто сейчас проходит тест\n\n", options: { fontSize: 16 } },
  { text: "📊  Прогресс каждого участника\n\n", options: { fontSize: 16 } },
  { text: "⏱️  Время начала тестирования\n\n", options: { fontSize: 16 } },
  { text: "✅  Завершенные тесты с результатами\n\n", options: { fontSize: 16 } },
  { text: "📜  Возможность выдать сертификат", options: { fontSize: 16 } },
], { x: 0.5, y: 1, w: 5.5, h: 4.2, color: COLORS.text, valign: "top" });
slide8.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 6, y: 1, w: 3.8, h: 4.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.green, width: 2 } });
slide8.addText("🟢 Real-time\n\nДанные обновляются\nавтоматически\nбез перезагрузки\nстраницы", { x: 6, y: 1.5, w: 3.8, h: 3.5, fontSize: 16, color: COLORS.text, align: "center", valign: "middle" });

// Slide 9: Вопросы - PLACEHOLDER
let slide9 = pptx.addSlide();
slide9.addText("Управление вопросами", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide9.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 4.3, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2 } });
slide9.addText("📷\n\nВставьте скриншот вкладки \"Вопросы\"\n(импорт из Word + список загруженных вопросов)\n\n(Image 2)", { x: 0.3, y: 1.8, w: 9.4, h: 2.5, fontSize: 18, color: COLORS.textLight, align: "center", valign: "middle" });
slide9.addText("Импорт из Word • Просмотр вопросов с ответами • Правильный ответ выделен", { x: 0.5, y: 5.3, w: 9, fontSize: 13, color: COLORS.textLight, align: "center" });

// Slide 10: Импорт вопросов
let slide10 = pptx.addSlide();
slide10.addText("Простой импорт вопросов", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide10.addText([
  { text: "Загрузите Word документ:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "Поддерживаемые форматы:\n\n", options: { fontSize: 13, color: COLORS.textLight } },
  { text: "Нумерованный:\n", options: { bold: true, fontSize: 13 } },
  { text: "1.1 Текст вопроса\n1.1.1 Вариант A\n1.1.2 Вариант B ✓\n\n", options: { fontSize: 11, fontFace: "Courier New" } },
  { text: "Буквенный:\n", options: { bold: true, fontSize: 13 } },
  { text: "1. Текст вопроса\nA) Вариант A\nB) Вариант B ✓\nC) Вариант C", options: { fontSize: 11, fontFace: "Courier New" } },
], { x: 0.5, y: 1, w: 4.5, h: 4.2, color: COLORS.text, valign: "top" });
slide10.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.3, y: 1, w: 4.5, h: 2.2, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2 } });
slide10.addText("📄 → 📥\n\nПросто перетащите файл", { x: 5.3, y: 1.3, w: 4.5, h: 1.8, fontSize: 18, color: COLORS.text, align: "center", valign: "middle" });
slide10.addText([
  { text: "✓ Автоматическое распознавание\n", options: { fontSize: 13 } },
  { text: "✓ Определение правильных ответов\n", options: { fontSize: 13 } },
  { text: "✓ Мгновенная загрузка", options: { fontSize: 13 } },
], { x: 5.3, y: 3.4, w: 4.5, h: 1.5, color: COLORS.text });

// Slide 11: Пользователи - PLACEHOLDER
let slide11 = pptx.addSlide();
slide11.addText("Управление пользователями", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide11.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.3, y: 0.9, w: 9.4, h: 4.3, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2 } });
slide11.addText("📷\n\nВставьте скриншот вкладки \"Пользователи\"\n(импорт + список с временными окнами)\n\n(Image 1)", { x: 0.3, y: 1.8, w: 9.4, h: 2.5, fontSize: 18, color: COLORS.textLight, align: "center", valign: "middle" });
slide11.addText("Импорт из файла • Временные окна для каждого • Статусы • Удаление", { x: 0.5, y: 5.3, w: 9, fontSize: 13, color: COLORS.textLight, align: "center" });

// Slide 12: Временные окна
let slide12 = pptx.addSlide();
slide12.addText("Гибкое расписание", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
slide12.addText([
  { text: "Для каждого пользователя:\n\n", options: { bold: true, fontSize: 18 } },
  { text: "🕐  Время начала тестирования\n\n", options: { fontSize: 16 } },
  { text: "🕐  Время окончания тестирования\n\n", options: { fontSize: 16 } },
  { text: "\nПользователь не сможет:\n\n", options: { bold: true, fontSize: 16 } },
  { text: "❌  Начать тест раньше\n\n", options: { fontSize: 14 } },
  { text: "❌  Продолжить после окончания\n\n", options: { fontSize: 14 } },
  { text: "❌  Пройти тест повторно", options: { fontSize: 14 } },
], { x: 0.5, y: 1, w: 5, h: 4.2, color: COLORS.text, valign: "top" });
slide12.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 5.5, y: 1, w: 4.3, h: 3.8, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 2 } });
slide12.addText("Пример:\n\n👤 Иванов Иван\n\n📅 Начало: 03.04.2026, 10:00\n📅 Конец: 03.04.2026, 12:00\n\n⏱️ 2 часа на тест", { x: 5.7, y: 1.2, w: 3.9, h: 3.4, fontSize: 14, color: COLORS.text, valign: "top" });

// Slide 13: Экспорт
let slide13 = pptx.addSlide();
slide13.addText("Результаты и отчеты", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
const exports = [
  { icon: "📊", title: "Экспорт CSV", desc: "Для Excel и анализа данных" },
  { icon: "📋", title: "Экспорт JSON", desc: "Для интеграций с другими системами" },
  { icon: "📜", title: "Сертификаты", desc: "PDF документы для участников" },
];
exports.forEach((item, i) => {
  slide13.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + i * 3.2, y: 1.2, w: 3, h: 2.6, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide13.addText(item.icon, { x: 0.5 + i * 3.2, y: 1.5, w: 3, fontSize: 36, align: "center" });
  slide13.addText(item.title, { x: 0.5 + i * 3.2, y: 2.4, w: 3, fontSize: 15, bold: true, align: "center", color: COLORS.text });
  slide13.addText(item.desc, { x: 0.6 + i * 3.2, y: 2.9, w: 2.8, fontSize: 11, align: "center", color: COLORS.textLight });
});
slide13.addText("Все результаты сохраняются для анализа, отчетности и выдачи сертификатов", { x: 0.5, y: 4.2, w: 9, fontSize: 14, color: COLORS.textLight, align: "center" });

// Slide 14: Преимущества
let slide14 = pptx.addSlide();
slide14.addText("Почему выбирают нас?", { x: 0.5, y: 0.3, w: "90%", fontSize: 32, bold: true, color: COLORS.text });
const benefits = [
  { icon: "⚡", title: "Быстрый старт", desc: "Загрузите вопросы и пользователей" },
  { icon: "👁️", title: "Real-time", desc: "Следите за тестами онлайн" },
  { icon: "🔒", title: "Безопасность", desc: "Защита от повторного прохождения" },
  { icon: "📱", title: "Удобство", desc: "Интуитивный интерфейс" },
  { icon: "⏰", title: "Контроль", desc: "Гибкие временные окна" },
  { icon: "📊", title: "Аналитика", desc: "Экспорт и отчеты" },
];
benefits.forEach((item, i) => {
  const row = Math.floor(i / 3);
  const col = i % 3;
  slide14.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: 0.5 + col * 3.2, y: 1.1 + row * 2.2, w: 3, h: 1.9, fill: { color: COLORS.bgLight }, line: { color: COLORS.primary, width: 1 } });
  slide14.addText(item.icon, { x: 0.5 + col * 3.2, y: 1.3 + row * 2.2, w: 3, fontSize: 26, align: "center" });
  slide14.addText(item.title, { x: 0.5 + col * 3.2, y: 2 + row * 2.2, w: 3, fontSize: 13, bold: true, align: "center", color: COLORS.text });
  slide14.addText(item.desc, { x: 0.6 + col * 3.2, y: 2.4 + row * 2.2, w: 2.8, fontSize: 10, align: "center", color: COLORS.textLight });
});

// Slide 15: Final
let slide15 = pptx.addSlide();
slide15.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: "100%", h: "100%", fill: { color: COLORS.primary } });
slide15.addText("Платформа тестирования", { x: 0.5, y: 2, w: "90%", fontSize: 44, bold: true, color: COLORS.white, align: "center" });
slide15.addText("Простое и удобное решение\nдля онлайн-тестирования", { x: 0.5, y: 3.2, w: "90%", fontSize: 22, color: COLORS.white, align: "center" });
slide15.addText("Спасибо за внимание!", { x: 0.5, y: 4.6, w: "90%", fontSize: 18, color: COLORS.white, align: "center" });

pptx.writeFile({ fileName: "test-platform-final.pptx" }).then(() => {
  console.log("✅ Презентация создана: test-platform-final.pptx");
  console.log("\n📌 Замените placeholder'ы на слайдах 6, 7, 9, 11 вашими скриншотами:");
  console.log("   Слайд 6 - Image 4 (Тестирование пройдено)");
  console.log("   Слайд 7 - Image 3 (Dashboard)");
  console.log("   Слайд 9 - Image 2 (Вопросы)");
  console.log("   Слайд 11 - Image 1 (Пользователи)");
});
