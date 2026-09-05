/**
 * In-Memory Session Store for managing active Playwright Browser Contexts
 */

class SessionStore {
  constructor(defaultTtlMs = 300000) { // 5 minutes default
    this.sessions = new Map();
    this.defaultTtlMs = defaultTtlMs;

    // Run garbage collection every 60 seconds
    this.gcInterval = setInterval(() => this.cleanupExpired(), 60000);
    if (this.gcInterval.unref) {
      this.gcInterval.unref();
    }
  }

  set(sessionId, data, ttlMs = this.defaultTtlMs) {
    // If session already exists, clean up its previous resources
    if (this.sessions.has(sessionId)) {
      this.delete(sessionId);
    }

    const expiresAt = Date.now() + ttlMs;
    this.sessions.set(sessionId, {
      ...data,
      expiresAt,
      createdAt: Date.now()
    });
  }

  get(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.delete(sessionId);
      return null;
    }

    return session;
  }

  async delete(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      try {
        if (session.page && !session.page.isClosed()) {
          await session.page.close().catch(() => {});
        }
        if (session.context) {
          await session.context.close().catch(() => {});
        }
      } catch (err) {
        // Silently ignore browser close errors during cleanup
      }
      this.sessions.delete(sessionId);
    }
  }

  async cleanupExpired() {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        await this.delete(sessionId);
      }
    }
  }

  async closeAll() {
    for (const sessionId of this.sessions.keys()) {
      await this.delete(sessionId);
    }
  }
}

export const sessionStore = new SessionStore();
