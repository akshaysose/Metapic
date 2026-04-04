# 🚀 Metapic (KwikPic) — Complete Run Guide

This guide explains how to set up, configure, and run the full Metapic project from scratch. The project has **3 services** that need to run together:

| Service | Tech | Port |
|---|---|---|
| `frontend` | React + Vite | `5173` |
| `backend` | Node.js + Express | `4000` |
| `face-service` | Python + FastAPI | `8000` |
| `MongoDB` (database) | Docker image | `27017` |

---

## 📋 Table of Contents

1. [Prerequisites](#-prerequisites)
2. [Environment Variables](#-environment-variables)
3. [Option A — Run with Docker (Recommended)](#-option-a--run-with-docker-recommended)
4. [Option B — Run Manually (Without Docker)](#-option-b--run-manually-without-docker)
5. [Dependencies Reference](#-dependencies-reference)
6. [Ports & URLs](#-ports--urls)
7. [Troubleshooting](#-troubleshooting)

---

## ✅ Prerequisites

Before you start, make sure you have the following installed on your machine:

### For Docker (Recommended Method)
- **Docker Desktop** → https://www.docker.com/products/docker-desktop/
  - Verify: `docker --version`
  - Verify: `docker compose version`

### For Manual Method
- **Node.js v18+** → https://nodejs.org/
  - Verify: `node --version`
  - Verify: `npm --version`
- **Python 3.10+** → https://www.python.org/downloads/
  - Verify: `python --version`
  - Verify: `pip --version`
- **MongoDB** → https://www.mongodb.com/try/download/community
  - OR use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud version)

### External Services (Required for Both Methods)
- **Cloudinary Account** → https://cloudinary.com/ (free tier works, used for image storage)
- **SMTP Email Service** → e.g., [Mailtrap](https://mailtrap.io/) (free, for sending emails)

---

## 🔐 Environment Variables

The backend needs a `.env` file to run. Create the file at:

```
Metapic/
└── backend/
    └── .env    ← Create this file
```

### How to Create the `.env` File

**Windows (PowerShell):**
```powershell
cd "c:\Users\aksha\Desktop\Akshay WS\Metapic\backend"
New-Item -Name ".env" -ItemType File
```

**Or simply create `backend/.env` manually in any text editor.**

### `.env` File Contents

Copy and paste this into `backend/.env`, then fill in your real values:

```env
# ─────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────

# If using Docker → keep as-is (mongo is the Docker service name)
MONGO_URI=mongodb://mongo:27017/kwikpic

# If running Manually locally → use this instead:
# MONGO_URI=mongodb://localhost:27017/kwikpic

# If using MongoDB Atlas (cloud):
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kwikpic


# ─────────────────────────────────────────────
# CLOUDINARY (Image Storage) — REQUIRED
# Get these from: https://cloudinary.com/console
# ─────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


# ─────────────────────────────────────────────
# JWT (Authentication Secret)
# Use any long random string — keep it secret!
# ─────────────────────────────────────────────
JWT_SECRET=replace_with_a_long_random_secret_string_here


# ─────────────────────────────────────────────
# FACE SERVICE URL
# If using Docker → keep as-is
# If running Manually → use: http://localhost:8000
# ─────────────────────────────────────────────
FACE_SERVICE_URL=http://face-service:8000


# ─────────────────────────────────────────────
# EMAIL / SMTP
# ⚠️  NOTE: nodemailer is installed as a dependency but email sending
#     is NOT yet implemented in the codebase. These values are read
#     by dotenv but never used. You can safely leave them blank or
#     fill them in for future use.
# ─────────────────────────────────────────────
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=


# ─────────────────────────────────────────────
# FRONTEND URL (for CORS and email links)
# ─────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173


# ─────────────────────────────────────────────
# SERVER PORT (optional, defaults to 4000)
# ─────────────────────────────────────────────
PORT=4000
```

### Where to Get Each Value

| Variable | Where to Get It |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Dashboard → Settings → Account |
| `CLOUDINARY_API_KEY` | Cloudinary Dashboard → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary Dashboard → Settings → API Keys |
| `JWT_SECRET` | Make up any random string (e.g., `myapp_super_secret_2024`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Your email or Mailtrap → Inbox → SMTP Settings |
| `MONGO_URI` | Local MongoDB or MongoDB Atlas connection string |

---

## 🐳 Option A — Run with Docker (Recommended)

This is the **easiest method**. Docker will automatically set up and run all 4 services (frontend, backend, face-service, MongoDB) together.

### Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd Metapic
```

### Step 2 — Create the `.env` file

Follow the [Environment Variables](#-environment-variables) section above and create `backend/.env`.

### Step 3 — Build and Start All Services

```bash
docker compose up --build
```

> The **first time** this runs, it will download Docker images and install dependencies. This may take **5–15 minutes** depending on your internet speed.

### Step 4 — Open the App

Once you see `Backend listening on 4000` in the terminal, open:

| Service | URL |
|---|---|
| 🌐 Frontend (App UI) | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:4000 |
| 🤖 Face Service API Docs | http://localhost:8000/docs |

### Useful Docker Commands

```bash
# Run in background (detached mode)
docker compose up --build -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View logs for a specific service
docker compose logs -f backend

# Rebuild only one service
docker compose up --build backend
```

---

## 🛠️ Option B — Run Manually (Without Docker)

Use this method if you don't want Docker, or want to develop and debug each service separately.

> ⚠️ You need **4 separate terminal windows/tabs** for this method — one for each service.

---

### 1. Start MongoDB

If you installed MongoDB locally:
```bash
mongod
# OR on Windows:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

OR use **MongoDB Atlas** and paste your connection string into `MONGO_URI` in `.env`.

---

### 2. Start the Face Service (Python / FastAPI)

Open **Terminal 1**:

```bash
cd Metapic/face-service
```

**Create and activate a virtual environment** (recommended):

```bash
# Create virtual environment
python -m venv .venv

# Activate on Windows
.venv\Scripts\activate

# Activate on Mac/Linux
source .venv/bin/activate
```

**Install Python dependencies:**
```bash
pip install -r requirements.txt
```

**Start the face service:**
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

✅ Face Service running at → http://localhost:8000

> **Note:** The first run will download the InsightFace AI model (~500MB). Be patient!

---

### 3. Start the Backend (Node.js / Express)

Open **Terminal 2**:

```bash
cd Metapic/backend
```

**Install Node.js dependencies:**
```bash
npm install
```

**Make sure `backend/.env` is set up** (see Environment Variables section).

**Also update `FACE_SERVICE_URL` for manual mode:**
```env
FACE_SERVICE_URL=http://localhost:8000
MONGO_URI=mongodb://localhost:27017/kwikpic
```

**Start the backend:**
```bash
# Development mode (auto-restarts on file changes)
npm run dev

# OR production mode
npm start
```

✅ Backend running at → http://localhost:4000

---

### 4. Start the Frontend (React / Vite)

Open **Terminal 3**:

```bash
cd Metapic/frontend
```

**Install Node.js dependencies:**
```bash
npm install
```

**Start the frontend dev server:**
```bash
npm run dev
```

✅ Frontend running at → http://localhost:5173

---

## 📦 Dependencies Reference

### Backend (`backend/package.json`)

| Package | Purpose |
|---|---|
| `express` | HTTP web server framework |
| `mongoose` | MongoDB database connection & models |
| `dotenv` | Load environment variables from `.env` |
| `jsonwebtoken` | JWT-based authentication tokens |
| `bcryptjs` | Password hashing |
| `passport` + `passport-jwt` + `passport-local` | Auth strategies |
| `cloudinary` | Upload/manage images on Cloudinary |
| `multer` + `streamifier` | Handle file uploads from forms |
| `nodemailer` | Send emails (e.g., verification) |
| `cors` | Allow cross-origin requests from frontend |
| `axios` | Make HTTP requests (to face service) |
| `express-rate-limit` | Limit API request rate (security) |
| `nodemon` *(dev)* | Auto-restart backend on file changes |
| `jest` + `supertest` *(dev)* | Unit and API testing |

**Install command:**
```bash
cd backend && npm install
```

---

### Frontend (`frontend/package.json`)

| Package | Purpose |
|---|---|
| `react` + `react-dom` | Core React UI library |
| `vite` | Fast dev server & bundler |
| `react-router-dom` | Client-side page routing |
| `axios` | HTTP requests to the backend API |
| `tailwindcss` | Utility-first CSS styling |
| `react-qr-code` | Generate QR codes for event sharing |
| `browser-image-compression` | Compress images before upload |
| `@vitejs/plugin-react` *(dev)* | Vite plugin for React support |
| `postcss` + `autoprefixer` *(dev)* | CSS processing for Tailwind |

**Install command:**
```bash
cd frontend && npm install
```

---

### Face Service (`face-service/requirements.txt`)

| Package | Purpose |
|---|---|
| `fastapi` | Python web API framework |
| `uvicorn[standard]` | ASGI server to run FastAPI |
| `pydantic` | Data validation for API requests |
| `numpy` | Numerical arrays (used for face embeddings) |
| `opencv-python-headless` | Image processing (read/decode image bytes) |
| `insightface` | AI model for face detection & recognition |
| `aiofiles` | Async file I/O |
| `python-multipart` | Parse multipart form data (file uploads) |

**Install command:**
```bash
cd face-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

---

## 🌐 Ports & URLs

| Service | URL | Notes |
|---|---|---|
| Frontend | http://localhost:5173 | Main app UI |
| Backend API | http://localhost:4000 | REST API |
| Face Service | http://localhost:8000 | AI microservice |
| Face Service Docs | http://localhost:8000/docs | Swagger UI (auto-generated) |
| MongoDB | mongodb://localhost:27017 | Database (no UI by default) |

> To explore the MongoDB database visually, install [MongoDB Compass](https://www.mongodb.com/products/compass) and connect to `mongodb://localhost:27017`.

---

## 🔧 Troubleshooting

### ❌ `EADDRINUSE` — Port already in use
```bash
# Find what's using the port (e.g., 4000)
netstat -ano | findstr :4000

# Kill the process (replace <PID> with the number shown)
taskkill /PID <PID> /F
```

### ❌ MongoDB connection error
- Make sure MongoDB is running: `mongod`
- Check `MONGO_URI` in `backend/.env` is correct
- If using Atlas, whitelist your IP in Atlas → Network Access

### ❌ Cloudinary upload fails
- Double-check `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `.env`
- Make sure the Cloudinary account is active

### ❌ Face service takes too long to start
- The **InsightFace model downloads ~500MB** on first run — this is normal.
- Wait for the message: `Application startup complete`

### ❌ `pip install` fails on `insightface`
- Make sure you have **C++ build tools** installed (Windows):
  - Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Make sure Python version is **3.10 or 3.11** (not 3.12+)

### ❌ Frontend shows blank page or API errors
- Make sure the **backend is running** on port `4000`
- Check the browser console for CORS errors
- Verify `FRONTEND_URL=http://localhost:5173` is set in `backend/.env`

---

*Documentation created by Antigravity — Last updated: March 2026*
