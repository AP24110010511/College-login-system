# Stage 1: Build Frontend
FROM node:20-bookworm-slim AS builder

WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Stage 2: Production Runtime with Playwright & Chromium
FROM node:20-bookworm-slim

WORKDIR /app

# Install system dependencies required by Chromium on Linux
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    curl \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Install Chromium browser binary for Playwright
RUN cd backend && npx playwright install chromium

# Copy backend source code
COPY backend/ ./backend/

# Copy compiled frontend build from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV HEADLESS=true
ENV SERVE_STATIC=true

EXPOSE 5001 10000 8080

WORKDIR /app/backend
CMD ["node", "server.js"]
