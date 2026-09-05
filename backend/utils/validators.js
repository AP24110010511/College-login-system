/**
 * Input validators for SRM AP login payload
 */

/**
 * Validates the login request payload.
 * SRM AP registration numbers typically start with 'AP' (e.g. AP24110010511) or application numbers.
 */
export function validateLoginPayload({ sessionId, username, password, captcha }) {
  const errors = [];

  if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
    errors.push('Session ID is missing or invalid. Please refresh the page.');
  }

  if (!username || typeof username !== 'string' || !username.trim()) {
    errors.push('Registration/Application Number is required.');
  } else {
    const cleanUser = username.trim();
    if (cleanUser.length < 4 || cleanUser.length > 20) {
      errors.push('Registration/Application Number length is invalid (4-20 characters).');
    }
    // Allow alphanumeric characters only
    if (!/^[A-Za-z0-9]+$/.test(cleanUser)) {
      errors.push('Registration/Application Number contains invalid characters.');
    }
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    errors.push('Password is required.');
  } else if (password.length < 3 || password.length > 50) {
    errors.push('Password length is invalid.');
  }

  if (!captcha || typeof captcha !== 'string' || !captcha.trim()) {
    errors.push('CAPTCHA text is required.');
  } else {
    const cleanCaptcha = captcha.trim();
    if (cleanCaptcha.length < 3 || cleanCaptcha.length > 8) {
      errors.push('CAPTCHA code must be 4 to 6 characters.');
    }
    if (!/^[A-Za-z0-9]+$/.test(cleanCaptcha)) {
      errors.push('CAPTCHA code contains invalid characters.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitizes input text for safe processing
 */
export function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str.trim();
}
