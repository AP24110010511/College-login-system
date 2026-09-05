import { chromium } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import { sessionStore } from './sessionStore.js';

const SRM_PORTAL_URL = process.env.SRM_PORTAL_URL || 'https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage';
const HEADLESS = process.env.HEADLESS !== 'false';

class SrmPortalService {
  constructor() {
    this.browser = null;
  }

  /**
   * Initializes or returns the shared Chromium browser instance
   */
  async getBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await chromium.launch({
        headless: HEADLESS,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Initiates a new SRM login session, navigates to the login page,
   * captures the live CAPTCHA element, and stores the session.
   */
  async createLoginSession() {
    const sessionId = uuidv4();
    const browser = await this.getBrowser();
    
    // Create an isolated incognito browser context for this student session
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    try {
      // Navigate to official SRM AP Student Corner
      await page.goto(SRM_PORTAL_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 25000
      });

      // Wait for CAPTCHA image element
      const captchaSelector = 'img[src*="captchas"], img[src*="captcha"]';
      await page.waitForSelector(captchaSelector, { timeout: 10000 });
      const captchaElement = await page.$(captchaSelector);

      if (!captchaElement) {
        throw new Error('CAPTCHA image could not be located on the SRM portal.');
      }

      // Capture screenshot of the CAPTCHA element
      const captchaBuffer = await captchaElement.screenshot();
      const captchaBase64 = `data:image/png;base64,${captchaBuffer.toString('base64')}`;

      // Save page and context in session store
      sessionStore.set(sessionId, {
        context,
        page,
        captchaCreatedAt: Date.now()
      });

      return {
        sessionId,
        captchaImage: captchaBase64
      };
    } catch (err) {
      await page.close().catch(() => {});
      await context.close().catch(() => {});
      throw new Error(`Failed to initialize SRM portal session: ${err.message}`);
    }
  }

  /**
   * Refreshes the CAPTCHA for an existing session or creates a new session if expired
   */
  async refreshCaptcha(existingSessionId) {
    const session = sessionStore.get(existingSessionId);

    if (session && session.page && !session.page.isClosed()) {
      try {
        const page = session.page;
        await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 });
        
        const captchaSelector = 'img[src*="captchas"], img[src*="captcha"]';
        await page.waitForSelector(captchaSelector, { timeout: 10000 });
        const captchaElement = await page.$(captchaSelector);
        
        const captchaBuffer = await captchaElement.screenshot();
        const captchaBase64 = `data:image/png;base64,${captchaBuffer.toString('base64')}`;
        
        session.captchaCreatedAt = Date.now();
        return {
          sessionId: existingSessionId,
          captchaImage: captchaBase64
        };
      } catch (err) {
        // Fallback to fresh session creation
        await sessionStore.delete(existingSessionId);
      }
    }

    return await this.createLoginSession();
  }

  /**
   * Performs the login on the live SRM portal using user-provided credentials & manual CAPTCHA.
   */
  async login({ sessionId, username, password, captcha }) {
    const session = sessionStore.get(sessionId);

    if (!session || !session.page || session.page.isClosed()) {
      return {
        success: false,
        error: 'Session expired or invalid. Please refresh the CAPTCHA and try again.',
        sessionExpired: true
      };
    }

    const { page, context } = session;

    try {
      // Ensure we are on the login page
      const currentUrl = page.url();
      if (!currentUrl.includes('StudentLoginPage') && !currentUrl.includes('srmapstudentcorner')) {
        await page.goto(SRM_PORTAL_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
      }

      // Check for presence of form fields
      await page.waitForSelector('#UserName', { timeout: 8000 });
      await page.waitForSelector('#AuthKey', { timeout: 8000 });
      await page.waitForSelector('#ccode', { timeout: 8000 });

      // Fill in user credentials & manual CAPTCHA
      await page.fill('#UserName', username.trim());
      await page.fill('#AuthKey', password);
      await page.fill('#ccode', captcha.trim());

      // Submit the form
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');
      if (!submitButton) {
        throw new Error('Login button not found on SRM portal page.');
      }

      // Wait for navigation or error response
      await Promise.all([
        page.waitForNavigation({ timeout: 20000, waitUntil: 'domcontentloaded' }).catch(() => null),
        submitButton.click()
      ]);

      // Check if we are still on login page / redirected with error
      const postSubmitUrl = page.url();

      // Check for error element #divmsg
      let errorMessage = null;
      try {
        const errorEl = await page.$('#divmsg');
        if (errorEl) {
          const text = (await errorEl.innerText()).trim();
          if (text) {
            errorMessage = text;
          }
        }
      } catch {
        // Ignore error reading error container
      }

      // Also check for alert popups or general error text in page
      if (errorMessage) {
        // Clean up session since CAPTCHA has been consumed
        await sessionStore.delete(sessionId);

        // Normalize known SRM error texts
        let friendlyError = errorMessage;
        if (errorMessage.toLowerCase().includes('captcha invalid')) {
          friendlyError = 'Incorrect CAPTCHA entered. Please try again.';
        } else if (errorMessage.toLowerCase().includes('invalid user') || errorMessage.toLowerCase().includes('password')) {
          friendlyError = 'Invalid Registration Number or Password.';
        }

        return {
          success: false,
          error: friendlyError,
          rawError: errorMessage
        };
      }

      // Check if URL indicates successful login (e.g. StudentHome, StudentCorner, etc.)
      const isStillLogin = postSubmitUrl.includes('StudentLoginPage') || postSubmitUrl.includes('StudentLoginToPortal');
      
      // Let's extract student name from the authenticated page
      const studentName = await this.extractStudentName(page);

      if (studentName) {
        // Authentication succeeded!
        await sessionStore.delete(sessionId);
        return {
          success: true,
          name: studentName,
          portalUrl: postSubmitUrl
        };
      }

      if (isStillLogin) {
        // Still on login page but no explicit #divmsg text
        const bodySnippet = await page.innerText('body').catch(() => '');
        if (bodySnippet.includes('Captcha Invalid') || bodySnippet.includes('Invalid')) {
          await sessionStore.delete(sessionId);
          return {
            success: false,
            error: 'Authentication failed. Please verify your Registration Number, Password, and CAPTCHA.'
          };
        }
      }

      // If we landed on a student portal page and extracted any identification
      if (!isStillLogin) {
        await sessionStore.delete(sessionId);
        return {
          success: true,
          name: studentName || username.toUpperCase()
        };
      }

      await sessionStore.delete(sessionId);
      return {
        success: false,
        error: 'Unable to authenticate with SRM AP Student Portal. Please verify your credentials.'
      };
    } catch (err) {
      await sessionStore.delete(sessionId);
      return {
        success: false,
        error: `Portal communication error: ${err.message || 'Timeout connecting to SRM portal'}`
      };
    }
  }

  /**
   * Robust multi-selector extractor for the student's name on authenticated portal pages
   */
  async extractStudentName(page) {
    try {
      // 1. Selector strategy for common SRM portal name headers
      const potentialSelectors = [
        '#lblStudentName',
        '#studentName',
        '.user-name',
        '.student-name',
        '.profile-name',
        'span[id*="Name"]',
        'div[id*="Name"]',
        '.navbar-nav .dropdown-toggle',
        '#welcomeMessage',
        '.welcome-user',
        'header .user-info',
        'h3.text-info',
        'h4.text-info'
      ];

      for (const selector of potentialSelectors) {
        const el = await page.$(selector);
        if (el) {
          const text = (await el.innerText()).trim();
          if (text && text.length > 1 && !text.toLowerCase().includes('login') && !text.toLowerCase().includes('welcome to')) {
            // Clean up prefix like "Welcome," "Hi," etc.
            return this.cleanExtractedName(text);
          }
        }
      }

      // 2. Scan for text patterns in header or navbar
      const nameFromHeader = await page.evaluate(() => {
        const header = document.querySelector('nav, header, .navbar, .header, #header');
        if (header) {
          const text = header.innerText;
          const match = text.match(/welcome\s*[,:]?\s*([A-Za-z\s.]+)/i) || 
                        text.match(/student\s*:\s*([A-Za-z\s.]+)/i) ||
                        text.match(/name\s*:\s*([A-Za-z\s.]+)/i);
          if (match && match[1]) {
            return match[1].trim();
          }
        }
        return null;
      });

      if (nameFromHeader) {
        return this.cleanExtractedName(nameFromHeader);
      }

      // 3. Fallback: Search all bold/heading tags on the page for student greetings
      const greetingFromPage = await page.evaluate(() => {
        const elements = document.querySelectorAll('b, strong, h1, h2, h3, h4, span, div');
        for (const el of elements) {
          const text = el.innerText.trim();
          if (/^welcome\s+[A-Za-z]/i.test(text) && text.length < 50) {
            return text.replace(/^welcome\s*[,:]?\s*/i, '').trim();
          }
        }
        return null;
      });

      if (greetingFromPage) {
        return this.cleanExtractedName(greetingFromPage);
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Sanitizes and cleans the extracted student name string
   */
  cleanExtractedName(rawName) {
    if (!rawName) return '';
    return rawName
      .replace(/^(welcome|hi|hello|student|mr|ms|mrs)[\s,.:]+/i, '')
      .replace(/[\n\r\t]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /**
   * Graceful cleanup of shared browser instance on server shutdown
   */
  async close() {
    await sessionStore.closeAll();
    if (this.browser) {
      await this.browser.close().catch(() => {});
      this.browser = null;
    }
  }
}

export const srmPortalService = new SrmPortalService();
