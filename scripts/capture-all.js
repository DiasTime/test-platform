const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const { testPageHTML, adminDashboardHTML, testResultHTML, waitingHTML } = require("./html-templates");

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

  console.log("Capturing screenshots...\n");

  // 1. Home page
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(screenshotsDir, "01-home.png") });
  console.log("✓ 01-home.png");

  // 2. Login page
  await page.goto("http://localhost:3000/login");
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: path.join(screenshotsDir, "02-login.png") });
  console.log("✓ 02-login.png");

  // 3. Login with filled form
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[placeholder="123456789012"]', "123456789012");
  await page.fill('input[placeholder="Иван"]', "Иван");
  await page.fill('input[placeholder="Иванов"]', "Иванов");
  await page.screenshot({ path: path.join(screenshotsDir, "03-login-filled.png") });
  console.log("✓ 03-login-filled.png");

  // 4. Test page (mock)
  await page.setContent(testPageHTML);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "04-test-page.png") });
  console.log("✓ 04-test-page.png");

  // 5. Test result (mock)
  await page.setContent(testResultHTML);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "05-test-result.png") });
  console.log("✓ 05-test-result.png");

  // 6. Waiting page (mock)
  await page.setContent(waitingHTML);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "06-waiting.png") });
  console.log("✓ 06-waiting.png");

  // 7. Admin dashboard (mock)
  await page.setContent(adminDashboardHTML);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, "07-admin-dashboard.png") });
  console.log("✓ 07-admin-dashboard.png");

  await browser.close();
  console.log("\n✅ All screenshots saved to:", screenshotsDir);
}

captureScreenshots().catch(console.error);
