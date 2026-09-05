# SRM AP Student Portal Login Tool

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.50-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

> **Disclaimer:** This project is an independent student developer prototype built for technical evaluation. It is **not** an official application of SRM University-AP and has no official university endorsement.

---

## 📌 Project Overview

The **SRM AP Student Portal Login Tool** is a full-stack web application that securely bridges authentication requests directly to the official **SRM AP Student Portal** (`https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage`).

When a student inputs their credentials and manually enters the dynamic image CAPTCHA served live from the university portal, the backend launches an isolated Playwright browser session, performs the authentication on the live portal, extracts the authenticated student's full name from the student dashboard, and presents it in a responsive interface.

---

## 🏛 Architecture

```
                                    +-----------------------------------------+
                                    |     Browser / React Client (Vite)       |
                                    |    - Registration Number Input          |
                                    |    - Password Input (with Masking)      |
                                    |    - Live CAPTCHA Display & Refresh     |
                                    +--------------------+--------------------+
                                                         |
                                            HTTPS / JSON | REST API
                                                         v
                                    +--------------------+--------------------+
                                    |     Node.js / Express Backend Server    |
                                    |    - Helmet Security Headers & CORS     |
                                    |    - IP Rate Limiting                   |
                                    |    - Session & Context Store (TTL: 5m)  |
                                    |    - In-Memory Validator                |
                                    +--------------------+--------------------+
                                                         |
                                      Playwright Bridge  | Isolated Context
                                                         v
                                    +--------------------+--------------------+
                                    |      Live SRM AP Student Corner         |
                                    |  https://student.srmap.edu.in/          |
                                    |  /srmapstudentcorner/StudentLoginPage   |
                                    +-----------------------------------------+
```

---

## 🛡️ Security & Privacy Principles

1. **Zero Credential Storage:** Passwords and usernames are never stored in databases, disk caches, or persistent volumes.
2. **Zero Password Logging:** Application logs strictly omit credentials, tokens, or sensitive payload data.
3. **Isolated Session Contexts:** Each CAPTCHA generation creates a dedicated, sandboxed browser context that is strictly cleaned up immediately after authentication or upon TTL expiration (5 minutes).
4. **No Session Leaks:** University `JSESSIONID` cookies are retained exclusively inside backend Playwright contexts and are never exposed to the frontend.
5. **No CAPTCHA Circumvention:** In compliance with ethical development principles, no automated OCR, solver, or bypass is implemented. The real image CAPTCHA is passed directly to the student for manual verification.

---

## 🧩 Portal Technical Inspection Details

Through live browser testing on the SRM AP Student Corner:
- **Base Portal URL:** `https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage`
- **Form Action:** `/srmapstudentcorner/StudentLoginToPortal` (Method: POST)
- **User Field:** `#UserName` (Registration / Application Number)
- **Password Field:** `#AuthKey`
- **CAPTCHA Endpoint:** `/srmapstudentcorner/captchas`
- **CAPTCHA Input:** `#ccode`
- **Submit Trigger:** `button[type="submit"]` / `$('#frmSL').submit()`
- **Error Container:** `#divmsg` (e.g., `"Captcha Invalid...."`)

---

## 🚀 Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

---

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd srm-ap-student-portal-tool
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install
npx playwright install chromium

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables
Inside `backend/`, copy the example `.env`:
```bash
cd backend
cp .env.example .env
```

Default configuration in `backend/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SRM_PORTAL_URL=https://student.srmap.edu.in/srmapstudentcorner/StudentLoginPage
SESSION_TTL_MS=300000
HEADLESS=true
```

---

## 💻 Running the Application

### Option A: Running with Root Scripts
From the root project directory:
```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend
```

### Option B: Running Individually
```bash
# Start Backend
cd backend
npm run dev
# Running on http://localhost:5000

# Start Frontend
cd frontend
npm run dev
# Running on http://localhost:5173
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Testing

### Backend Unit & Validation Tests
```bash
cd backend
npm test
```
Runs test cases covering payload validation, missing field constraints, sanitization, and error responses.

### Frontend Production Build Test
```bash
cd frontend
npm run build
```

---

## 🌐 API Specification

### 1. Fetch CAPTCHA & Initialize Session
- **Endpoint:** `GET /api/captcha`
- **Rate Limit:** 30 requests / 5 minutes
- **Response:**
  ```json
  {
    "success": true,
    "sessionId": "b8a5392e-13ab-41bf-bbce-93d4fba73b31",
    "captchaImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
  ```

### 2. Refresh CAPTCHA
- **Endpoint:** `POST /api/captcha/refresh`
- **Payload:** `{ "sessionId": "b8a5392e-13ab-41bf-bbce-93d4fba73b31" }`
- **Response:** Fresh CAPTCHA base64 image bound to the session.

### 3. Student Login
- **Endpoint:** `POST /api/login`
- **Rate Limit:** 15 requests / 5 minutes
- **Payload:**
  ```json
  {
    "sessionId": "b8a5392e-13ab-41bf-bbce-93d4fba73b31",
    "username": "AP24110010511",
    "password": "student_password",
    "captcha": "7X9KM"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "name": "Student Full Name",
    "message": "SRM AP Student Portal Login Successful"
  }
  ```
- **Failure Response (401 Unauthorized / 400 Bad Request):**
  ```json
  {
    "success": false,
    "error": "Incorrect CAPTCHA entered. Please try again."
  }
  ```

---

## 🚢 Deployment Guide

The repository includes a complete multi-stage **Dockerfile** powered by the official Microsoft Playwright container (`mcr.microsoft.com/playwright:v1.50.0-noble`), which pre-packages all required Chromium and Linux graphics libraries.

### Option 1: 1-Click Deploy on Render (Recommended)
1. Push this repository to GitHub.
2. Go to [Render.com](https://render.com/) -> **New** -> **Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](file:///Users/simhadrinandagopal/Desktop/project%20volta%20task/render.yaml) and configure the web service.
4. Click **Apply**.

### Option 2: Deploy on Railway
1. Push this repository to GitHub.
2. Open [Railway.app](https://railway.app/) -> **New Project** -> **Deploy from GitHub repo**.
3. Railway automatically detects [`Dockerfile`](file:///Users/simhadrinandagopal/Desktop/project%20volta%20task/Dockerfile) and [`railway.json`](file:///Users/simhadrinandagopal/Desktop/project%20volta%20task/railway.json).

### Option 3: Docker & Docker Compose (Self-Hosted VPS)
```bash
# Build and run the unified container in background
docker compose up -d --build

# View container logs
docker compose logs -f
```
The application will be live on `http://localhost:5001`.

### Option 4: Unified Production Server (Node.js)
```bash
# 1. Build frontend bundle and install dependencies
npm run build

# 2. Start unified production server
NODE_ENV=production PORT=5001 npm start
```
The single Node.js process serves both the compiled React frontend and the Playwright API routes.

1. **Active Portal Availability:** The application relies on real-time availability of `student.srmap.edu.in`. In case of university maintenance or downtime, a graceful `"Unable to connect to SRM AP portal"` alert is returned.
2. **Session Timeout:** CAPTCHA sessions expire after 5 minutes of inactivity to conserve server memory.
3. **Anti-DDoS / WAF:** Rate limiting is configured on both the Express server and respected for outbound portal requests to prevent IP blocking.
