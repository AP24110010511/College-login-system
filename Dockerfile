# Base image with Node.js and Playwright dependencies
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

ENV NODE_ENV=production
ENV HEADLESS=true
ENV SERVE_STATIC=true

# Copy package manifests
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN cd backend && npm install --omit=dev
RUN cd frontend && npm install

# Install Chromium browser binary for Playwright
RUN cd backend && npx playwright install chromium

# Copy app source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend production bundle
RUN cd frontend && npm run build

# Default fallback port (Render injects PORT dynamically)
EXPOSE 5001 10000 8080

WORKDIR /app/backend
CMD ["node", "server.js"]
