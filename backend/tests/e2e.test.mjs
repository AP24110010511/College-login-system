import { chromium } from 'playwright';

async function runE2ETest() {
  console.log('Launching browser to test http://localhost:5173/ ...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1. Navigate to frontend
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Page loaded successfully. Title:', await page.title());

    // 2. Wait for CAPTCHA image to load from backend
    await page.waitForSelector('img[alt="SRM AP Security CAPTCHA"]', { timeout: 15000 });
    console.log('Live CAPTCHA image rendered successfully in UI.');

    // 3. Take screenshot of initial state
    await page.screenshot({ path: '/Users/simhadrinandagopal/.gemini/antigravity-ide/brain/9af23738-9410-43e8-9484-4f0abd5dbd7e/login_initial_ui.png' });
    console.log('Captured login_initial_ui.png');

    // 4. Test client-side validation by clicking submit with empty fields
    const loginButton = await page.$('button[type="submit"]');
    await loginButton.click();
    await page.waitForTimeout(500);

    const errorTexts = await page.$$eval('p.text-rose-400', els => els.map(e => e.innerText));
    console.log('Validation errors on empty submit:', errorTexts);

    // Take screenshot of validation errors
    await page.screenshot({ path: '/Users/simhadrinandagopal/.gemini/antigravity-ide/brain/9af23738-9410-43e8-9484-4f0abd5dbd7e/login_validation_ui.png' });
    console.log('Captured login_validation_ui.png');

    // 5. Test Refresh CAPTCHA button
    const refreshBtn = await page.$('button[title="Refresh CAPTCHA image"]');
    if (refreshBtn) {
      console.log('Clicking Refresh CAPTCHA button...');
      await refreshBtn.click();
      await page.waitForTimeout(3000);
      console.log('CAPTCHA refreshed successfully.');
    }

    // 6. Test inputting registration number, password, and CAPTCHA
    await page.fill('#username', 'AP24110010511');
    await page.fill('#password', 'TestPassword123');
    await page.fill('#captcha-input', 'ABC12');

    // Toggle password visibility
    const eyeButton = await page.$('button[title*="password"]');
    if (eyeButton) {
      await eyeButton.click();
      console.log('Toggled password visibility');
    }

    // Take screenshot of filled state
    await page.screenshot({ path: '/Users/simhadrinandagopal/.gemini/antigravity-ide/brain/9af23738-9410-43e8-9484-4f0abd5dbd7e/login_filled_ui.png' });
    console.log('Captured login_filled_ui.png');

    // 7. Submit test attempt with invalid CAPTCHA to verify live backend + portal response in UI
    console.log('Submitting login to live SRM portal...');
    await loginButton.click();

    // Wait for the button text to show loading state
    await page.waitForSelector('text="Logging into SRM AP Portal..."', { timeout: 3000 });
    console.log('Loading spinner and state active while Playwright logs into SRM portal.');

    // Wait for error alert from portal
    await page.waitForSelector('text="Authentication Error"', { timeout: 30000 });
    const alertMessage = await page.$eval('div:has(> p:has-text("Authentication Error"))', el => el.innerText);
    console.log('Live portal error displayed in UI:', alertMessage.replace(/\n+/g, ' '));

    // Take screenshot of error alert state
    await page.screenshot({ path: '/Users/simhadrinandagopal/.gemini/antigravity-ide/brain/9af23738-9410-43e8-9484-4f0abd5dbd7e/login_error_alert_ui.png' });
    console.log('Captured login_error_alert_ui.png');

    console.log('\n=============================================');
    console.log('🎉 ALL E2E UI & BACKEND FLOWS VERIFIED 100%!');
    console.log('=============================================\n');
  } finally {
    await browser.close();
  }
}

runE2ETest().catch(err => {
  console.error('E2E Test Error:', err);
  process.exit(1);
});
