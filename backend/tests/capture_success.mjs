import { chromium } from 'playwright';

async function captureSuccessCard() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Simulate success state in React component by injecting state
  await page.evaluate(() => {
    window.document.querySelector('input#username').value = 'AP24110010511';
    // Trigger React state via mock or direct DOM replacement if needed
  });

  await browser.close();
}

captureSuccessCard().catch(() => {});
