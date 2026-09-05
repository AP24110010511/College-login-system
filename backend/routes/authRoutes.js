import { Router } from 'express';
import { srmPortalService } from '../services/srmPortalService.js';
import { validateLoginPayload, sanitizeInput } from '../utils/validators.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting for login attempts (15 requests per 5 minutes per IP)
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Too many login attempts. Please wait 5 minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting for CAPTCHA requests (30 requests per 5 minutes per IP)
const captchaLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Too many CAPTCHA requests. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * GET /api/captcha
 * Generates a new isolated session and fetches the live SRM CAPTCHA image
 */
router.get('/captcha', captchaLimiter, async (req, res) => {
  try {
    const sessionData = await srmPortalService.createLoginSession();
    return res.status(200).json({
      success: true,
      sessionId: sessionData.sessionId,
      captchaImage: sessionData.captchaImage
    });
  } catch (err) {
    console.error('[Error: /api/captcha]', err.message);
    return res.status(500).json({
      success: false,
      error: 'Unable to connect to SRM AP portal. Please ensure the portal is accessible and try again.'
    });
  }
});

/**
 * POST /api/captcha/refresh
 * Refreshes the CAPTCHA for an active session or spawns a new one
 */
router.post('/captcha/refresh', captchaLimiter, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const sessionData = await srmPortalService.refreshCaptcha(sessionId);
    return res.status(200).json({
      success: true,
      sessionId: sessionData.sessionId,
      captchaImage: sessionData.captchaImage
    });
  } catch (err) {
    console.error('[Error: /api/captcha/refresh]', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to refresh CAPTCHA. Please reload the page.'
    });
  }
});

/**
 * POST /api/login
 * Validates payload and performs SRM AP authentication via Playwright
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { sessionId, username, password, captcha } = req.body;

    // 1. Validate payload
    const validation = validateLoginPayload({ sessionId, username, password, captcha });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.errors.join(' ')
      });
    }

    // 2. Perform authentication with the live SRM AP portal
    // Passwords are NEVER logged or stored
    const result = await srmPortalService.login({
      sessionId: sanitizeInput(sessionId),
      username: sanitizeInput(username),
      password: password, // not sanitized to preserve complex characters
      captcha: sanitizeInput(captcha)
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        name: result.name,
        message: 'SRM AP Student Portal Login Successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        error: result.error || 'Authentication failed. Please check your credentials.',
        sessionExpired: !!result.sessionExpired
      });
    }
  } catch (err) {
    console.error('[Error: /api/login]', err.message);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred during login. Please try again.'
    });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SRM AP Student Portal Login Tool'
  });
});

export default router;
