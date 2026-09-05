const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5001/api');

export const api = {
  /**
   * Fetches a new SRM portal session with live CAPTCHA image
   */
  async getCaptcha() {
    try {
      const response = await fetch(`${API_BASE}/captcha`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return {
        success: false,
        error: 'Unable to reach backend server. Please make sure the backend is running on port 5001.'
      };
    }
  },

  /**
   * Refreshes the CAPTCHA image for an active session
   */
  async refreshCaptcha(sessionId) {
    try {
      const response = await fetch(`${API_BASE}/captcha/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return {
        success: false,
        error: 'Failed to refresh CAPTCHA from server.'
      };
    }
  },

  /**
   * Submits credentials & CAPTCHA to log in to SRM AP Student Portal
   */
  async login({ sessionId, username, password, captcha }) {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ sessionId, username, password, captcha })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return {
        success: false,
        error: 'Connection error while communicating with authentication service.'
      };
    }
  },

  /**
   * Performs server health check
   */
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }
};
