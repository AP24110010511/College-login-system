# Use official Playwright base image with Chromium & all OS dependencies pre-installed
FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001
ENV HEADLESS=true
ENV SERVE_STATIC=true

# Copy package manifests
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install backend & frontend dependencies
RUN cd backend && npm install --omit=dev
RUN cd frontend && npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend production bundle
RUN cd frontend && npm run build

# Expose server port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5001/api/health || exit 1

# Start the unified backend server
WORKDIR /app/backend
CMD ["node", "server.js"]
