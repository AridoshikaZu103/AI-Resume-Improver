# ⚡ AI Resume Improver — Quick Reference Guide
> 🎯 Fast lookup for commands, API endpoints, and common issues

---

## 🚀 Quick Start (Copy-Paste Ready)

### 1️⃣ Setup Backend (Tab #1)
```bash
cd ai-resume-improver/backend
npm install
npm start
```
✅ Backend runs on: `http://localhost:8000`

### 2️⃣ Setup Frontend (Tab #2)
```bash
cd ai-resume-improver/frontend
npx http-server -p 3000
```
✅ Frontend runs on: `http://localhost:3000`

### 3️⃣ Access App
```
Open browser → http://localhost:3000 → Click "🚀 Get Started"
```

---

## 📦 NPM Commands (Backend)

```bash
# Install dependencies
npm install

# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Check installed packages
npm list

# Install specific package
npm install <package-name>
```

---

## 🔑 Environment Variables (.env)

### 🟢 Heuristic Mode (Free, No API Key)
```
PORT=8000
NODE_ENV=development
PROVIDER=heuristic
```

### 🤖 OpenAI Mode (Requires API Key)
```
PORT=8000
NODE_ENV=development
PROVIDER=auto
OPENAI_API_KEY=sk-YOUR_KEY_HERE
OPENAI_MODEL=gpt-3.5-turbo
```

> 🚨 **Never commit `.env` to git!** Add to `.gitignore`

---

## 🔌 API Endpoints

### 🏥 Health Check
```
GET http://localhost:8000/api/health
```
**Response:**
```json
{
  "status": "Backend running (OpenAI mode)",
  "timestamp": "2026-04-02T09:30:45.123Z"
}
```

---

### 📊 Analyze Resume
```
POST http://localhost:8000/api/resume/analyze
Content-Type: multipart/form-data
Body: file (PDF)
```
**Response:**
```json
{
  "result": {
    "score": 85,
    "suggestions": "Add quantifiable achievements...",
    "keywords": "python, aws, docker, javascript, react, node.js",
    "improved_resume": "Enhanced resume text...",
    "provider": "heuristic | openai | openai_fallback_heuristic"
  }
}
```
**📝 cURL Example:**
```bash
curl -X POST http://localhost:8000/api/resume/analyze \
  -F "file=@/path/to/resume.pdf"
```

---

### 🎯 ATS Gap Analysis *(New)*
```
POST http://localhost:8000/api/resume/gap-analyze
Content-Type: multipart/form-data
Body: file (PDF) + jd (Job Description text)
```
**Response:**
```json
{
  "result": {
    "jdKeywords": ["python", "aws", "docker", "react", "node.js", "kubernetes"],
    "matchedKeywords": ["python", "aws", "docker", "react", "node.js"],
    "missingKeywords": ["kubernetes", "machine", "learning"],
    "sections": [
      {
        "title": "MAIN",
        "score": 85,
        "weak": false,
        "keywordsFound": ["python", "aws", "docker", "react", "node.js"],
        "suggestions": []
      }
    ],
    "recommendations": [
      "Add the following keywords from the JD: kubernetes, machine learning",
      "Resume has strong keyword match to the JD — good alignment!"
    ]
  }
}
```
**📝 cURL Example:**
```bash
curl -F "file=@/path/to/resume.pdf" \
  -F "jd=We are looking for a Full Stack Developer..." \
  http://localhost:8000/api/resume/gap-analyze
```

---

## 🗂️ Project Structure

```
ai-resume-improver/
├── backend/
│   ├── server.js           # Main server
│   ├── generate_pdf.js     # PDF generation helper
│   ├── verify_pdf.js       # PDF validation helper
│   ├── uploads/            # Temp PDF uploads
│   ├── package.json
│   ├── .env                # Config (create manually)
│   └── node_modules/       # Dependencies
│
└── frontend/
    ├── index.html          # Landing page
    ├── register.html       # Sign up
    ├── analyzer.html       # Resume analyzer
    ├── gmail.html          # Email integration
    └── style.css           # Styling
```

---

## 🐛 Common Issues & Fixes

### ❌ "Backend not reachable"
> 🔍 **Cause:** Backend not running or wrong port.
```bash
# Check if backend is running
curl http://localhost:8000/api/health

# If fails, start backend:
cd backend && npm start
```

---

### ❌ "Cannot find module"
> 🔍 **Cause:** Missing or corrupted node_modules.
```bash
cd backend
rm -rf node_modules
npm install
npm start
```

---

### ❌ "Port 8000 already in use"
> 🔍 **Cause:** Another process is occupying the port.
```bash
# Change PORT in .env
PORT=8001

# Or kill process using port 8000 (macOS/Linux)
lsof -ti:8000 | xargs kill -9

# Or (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

---

### ❌ "Port 3000 already in use"
> 🔍 **Cause:** Another process is occupying port 3000.
```bash
npx http-server -p 3001
# Then open http://localhost:3001
```

---

### ❌ "PDF parsing error" or "bad XRef entry"
> 🔍 **Cause:** PDF is a scanned image with no selectable text layer.
> ✅ **Fix:** Ensure PDF has selectable text (not a scanned image). Regenerate from Word/Google Docs or use the included `generate_pdf.js` helper.

---

### ❌ "API returns 500 error"
> 🔍 **Cause:** Server-side issue — missing config or bad input.
```bash
# Check backend console for detailed error
# Common causes:
# 1. Missing .env file
# 2. Invalid OPENAI_API_KEY
# 3. Corrupted PDF file
```

---

### ❌ "ATS Gap Analysis returns empty keywords"
> 🔍 **Cause:** Job Description text not passed correctly in the request.
> ✅ **Fix:** Ensure the `jd` field is included in the form data alongside the `file` field.

---

## 💡 Tips & Tricks

### 🔍 Debug Mode
Check browser DevTools Console:
```
F12 → Console → Check for API errors
```

### 📊 Test API Locally
```
Use Postman, Insomnia, or Thunder Client
Or use curl (see API Endpoints section above)
```

### 🔥 Hot Reload Backend
```bash
npm run dev
# Automatically restarts on file changes
```

### 📝 Generate Sample Resume PDF
```bash
cd backend
npm install pdfkit
node generate_pdf.js
# Creates: uploads/test_resume.pdf

node verify_pdf.js
# Validates the generated PDF
```

### 🧹 Clean Installation
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm start
```

---

## 🔒 Security Checklist

- ✅ `.env` file created (not in git)
- ✅ API keys never committed
- ✅ `.gitignore` includes `.env`
- ✅ Production: use server-side auth (not localStorage)
- ✅ Rotate keys if accidentally exposed

---

## 📱 Feature Quick Ref

| Feature | Status | Requires |
|---|---|---|
| Upload PDF | ✅ Ready | None |
| Score Resume | ✅ Ready | None |
| Get Suggestions | ✅ Ready | None |
| ATS Keywords | ✅ Ready | None |
| ATS Gap Analysis | ✅ Ready | None |
| Improved Resume | ✅ Ready | None |
| Better Quality (AI) | ⭐ Optional | OpenAI API Key |
| Download Resume | 🔄 In Dev | — |

---

## 🌐 URLs

| Service | URL | Status |
|---|---|---|
| 🎨 Frontend | http://localhost:3000 | 🟢 |
| 🔙 Backend | http://localhost:8000 | 🟢 |
| 🏥 Health Check | http://localhost:8000/api/health | 🟢 |
| 📊 Analyze Resume | http://localhost:8000/api/resume/analyze | 🟢 |
| 🎯 ATS Gap Analysis | http://localhost:8000/api/resume/gap-analyze | 🟢 |
| 🖥️ Browser Analyzer | http://localhost:8000/analyzer.html | 🟢 |

---

## 📞 Need Help?

- 📖 Check main `README.md` for detailed setup
- 🐛 Check Troubleshooting section above
- 💬 Open an issue on GitHub
- 🔍 Check browser console (`F12`)
- 📋 Check backend console logs

---

## 🎯 Development Workflow

```bash
# Terminal Tab #1 - Backend
cd backend && npm run dev

# Terminal Tab #2 - Frontend
cd frontend && npx http-server -p 3000

# Terminal Tab #3 (Optional) - Git
git status
git add .
git commit -m "feature: ..."
```

---

> 📅 Last Updated: April 2026
> 🏷️ Version: 2.0
> 📁 Repository: Code_Crew_Q4 / AI Resume Improver
