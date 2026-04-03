const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

const screenshotsDir = path.join(__dirname, "..", "screenshots");

async function captureScreenshots() {
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log("Capturing screenshots...");

  // 1. Home page
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(screenshotsDir, "01-home.png") });
  console.log("✓ Home page");

  // 2. Login page
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(screenshotsDir, "02-login.png") });
  console.log("✓ Login page");

  // 3. Login with filled form
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[placeholder="123456789012"]', "123456789012");
  await page.fill('input[placeholder="Иван"]', "Иван");
  await page.fill('input[placeholder="Иванов"]', "Иванов");
  await page.screenshot({ path: path.join(screenshotsDir, "03-login-filled.png") });
  console.log("✓ Login filled");

  // 4. Try to access admin (will redirect to login, but let's capture the admin page structure)
  // We'll create mock screenshots for admin by injecting HTML

  await browser.close();
  console.log("\nScreenshots saved to:", screenshotsDir);
}

captureScreenshots().catch(console.error);
