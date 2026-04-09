# 👨‍💼 Code_Crew_Q4

# 📄 AI Resume Improver

🤖 **AI Resume Improver** is a lightweight, full‑stack project that analyzes PDF resumes and returns a score, suggestions, ATS keywords, and a short improved resume. The backend can run in two modes:
---
## 📹 Video Tutorial

**[Demo Video (MP4)](https://drive.google.com/file/d/1Ioz58N4VJ16RHe--d-DaJ6o0oJIJE_Dv/view?usp=drive_link)**


---
 
## 👨‍💼 Team — Code_Crew_Q4 ⭐
 
| # | Name |
|---|---|
| 1 | Manasvi Inavolu |
| 2 | Chandana Nimishakavi |
| 3 | S Sooraj |
 
---
 
## 📌 Project Title ⭐
 
**AI Resume Improver**
 
A lightweight, full-stack resume analysis tool that helps job seekers optimize their resumes for Applicant Tracking Systems (ATS). Users upload a PDF resume and receive a score, actionable suggestions, keyword highlights, and an improved resume snippet — all within seconds.
 
---
 
## ✨ Preferred Features ⭐
 
These are the core features required for the project and are fully implemented:
 
| Feature | Description |
|---|---|
| 📤 **PDF Resume Upload** | Users upload their resume as a PDF file via the browser UI |
| 📊 **Resume Score (0–100)** | The system evaluates the resume and returns a numeric quality score |
| 💡 **Improvement Suggestions** | Contextual suggestions to improve resume structure, language, and impact |
| ✍️ **Improved Resume Snippet** | A short rewritten version of the resume summary is generated and displayed |
 
---
 
## 🔵 Optional Features
 
These features extend the core functionality and are fully implemented:
 
| Feature | Description |
|---|---|
| 🏷️ **ATS Keyword Extraction** | Automatically identifies and highlights industry-relevant keywords from the resume |
| 🎯 **ATS Gap Analysis** | Compares resume keywords against a pasted Job Description to identify matched and missing skills |
| 💾 **Download Improved Resume** | Allows users to download the improved resume output *(In Development)* |
| 🟢 **Heuristic Mode (Offline)** | Local rule-based analyzer that works without any API key — free and offline |
| 🤖 **OpenAI Integration** | Optional upgrade to OpenAI Chat Completions for higher-quality AI-powered analysis |
| 🔄 **Auto Fallback** | If OpenAI fails or is unavailable, the system automatically falls back to the heuristic analyzer |
| 📄 **PDF Generation Helper** | Includes a `generate_pdf.js` utility to create sample test resumes from plain text |
| ✅ **PDF Verification Script** | Includes a `verify_pdf.js` utility to validate PDF structure before upload |
 
---
 
## 🏆 Feature Challenge ⭐
 
### 🎯 ATS Gap Analysis — Resume vs Job Description Matching
 
**Challenge Statement:**
Most resume tools only analyze a resume in isolation. The real challenge is helping users understand *how well their resume matches a specific job description* — the way an ATS system actually evaluates candidates.
 
**What we built:**
A dedicated `/api/resume/gap-analyze` endpoint that:
1. Accepts a PDF resume and a raw Job Description (JD) text as inputs
2. Extracts and tokenizes keywords from both the resume and the JD
3. Identifies **matched keywords** (present in both) and **missing keywords** (in JD but not resume)
4. Scores each resume section independently
5. Returns targeted **recommendations** to close the gap
 
**Why it's challenging:**
- Requires simultaneous parsing of two different text sources (PDF + free-form text)
- Keyword matching must be intelligent — handling variations, stopword filtering, and partial matches
- Section-level scoring adds granularity beyond a single overall score
- Must work reliably in both heuristic (offline) and OpenAI modes
 
**Example Output:**
```json
{
  "jdKeywords":       ["python", "aws", "docker", "react", "kubernetes"],
  "matchedKeywords":  ["python", "aws", "docker", "react"],
  "missingKeywords":  ["kubernetes"],
  "sections": [
    { "title": "MAIN", "score": 85, "keywordsFound": ["python", "aws", "docker", "react"] }
  ],
  "recommendations": [
    "Add the following keywords from the JD: kubernetes",
    "Resume has strong keyword match to the JD — good alignment!"
  ]
}
```
 
**Impact:**
This feature transforms the tool from a generic resume reviewer into a *job-specific* optimization assistant — directly addressing how modern ATS systems filter candidates before a human ever reads the resume.
 
---

- 🔍 **Heuristic (local, free)**: analyzes the resume using local rules — no API keys required.
- ⚡ **OpenAI (optional)**: uses OpenAI Chat completions when an `OPENAI_API_KEY` is provided for higher-quality output. If OpenAI is unavailable, the server automatically falls back to the heuristic analyzer.

📦 This repository provides a simple frontend (HTML/CSS/JS) and a Node.js Express backend that accepts PDF upload, extracts text with `pdf-parse`, analyzes it, and returns structured JSON for the UI.

---

📑 **Table of contents**
- ✨ [Features](#features)
- 🛠️ [Tech stack](#tech-stack)
- 📁 [Repository structure](#repository-structure)
- 🚀 [Quick start (local)](#quick-start-local)
  - ⚙️ [Backend setup](#backend-setup)
  - 📦 [Verify & install dependencies (npm list → npm install)](#verify--install-dependencies-npm-list---npm-install)
  - 🎨 [Frontend setup](#frontend-setup)
  - 🧪 [Testing with a sample resume](#testing-with-a-sample-resume)
- 🔌 [Test via API (Command Prompt)](#test-via-api-command-prompt)
- 🔧 [Modes & environment variables](#modes--environment-variables)
- 🐛 [Troubleshooting](#troubleshooting)
- 🔒 [Security](#security)
- 🤝 [Contribution](#contribution)

---

## ✨ Features

**Preferred**
- 📤 Upload PDF resume
- 📊 Score (0–100)
- 💡 Suggestions for improvement
- ✍️ Improved resume snippet

**Optional / additional**
- 🏷️ ATS keyword extraction
- 💾 Download improved resume
- 🚀 Optional OpenAI integration (if you provide an API key)
- 🟢 Local heuristic analyzer — runs offline and free

---

## 🛠️ Tech Stack

- 🔙 **Backend**: Node.js, Express, multer, pdf-parse
- 🎨 **Frontend**: static HTML, CSS, vanilla JS
- 🤖 **Optional**: OpenAI (chat completions) — enabled when `OPENAI_API_KEY` is provided
- 🔨 **Dev tooling**: nodemon (dev)

---

## 📁 Repository Structure

```
ai-resume-improver/
├── backend/
│   ├── uploads/            # temporary user uploads
│   │   └── .gitkeep        # ensures folder exists in git
│   │   └── REsume.txt      # sample resume text
│   │   └── test_resume.pdf # upload PDF
│   ├── node_modules/       # installed packages (ignored)
│   ├── server.js           # main server logic
│   ├── generate_pdf.js     # helper for testing
│   ├── package.json
│   ├── verify_pdf.js
│   ├── package-lock.json
│   └── .env                # local environment variables
├── frontend/
│   ├── index.html
│   ├── register.html
│   ├── gmail.html
│   ├── analyzer.html
│   └── style.css
├── .gitignore              # tells git what to ignore
└── README.md
```

---

## 🚀 Quick Start (Local)

**📋 Prerequisites:**
- 💚 Node.js 18+ (tested)
- 📦 npm
- 🌐 (Optional) `npx http-server` for serving static frontend (or any static server)

1️⃣ **Clone repository**
```bash
git clone <your-repo-url>
cd ai-resume-improver
```

### ⚙️ Backend Setup

Navigate to the backend folder and install dependencies:
```bash
cd backend
npm install
```

---

### 📦 Verify & Install Dependencies (npm list → npm install)

Before running the server, you can check which packages are installed locally with npm list. Example output (your environment may differ):

```code
C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\backend>npm list
ai-resume-improver-backend@1.0.0 C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\backend
+-- cors@2.8.6
+-- dotenv@16.6.1
+-- express@4.22.1
+-- multer@1.4.5-lts.2
+-- nodemon@2.0.22
+-- openai@4.104.0
+-- pdf-parse@1.1.4
`-- pdfkit@0.18.0
```

**What this means:**
- `npm list` shows installed packages and versions in the current folder.
- If `npm list` reports missing packages or you cloned the repo fresh, run `npm install` (it reads package.json and installs all dependencies).
- If you prefer to install specific packages manually, you can run:
```bash
npm install express cors multer pdf-parse pdfkit dotenv openai nodemon
```
but `npm install` is usually sufficient.

After installing dependencies, start the backend:

```bash
npm start
# or during development:
npm run dev
```

You should see:

```code
Resume analyzer listening on http://localhost:8000 (mode: heuristic)
# or
Resume analyzer listening on http://localhost:8000 (mode: OpenAI enabled)
```

---

### 🎨 Frontend Setup

Example:

Installs npx globally so the npx command is available from any terminal.
```bash
cd  ../ai-resume-improver
npm install -g npx   
```

Serve the frontend folder with a static server (recommended) or open `index.html` in a browser:
```bash
cd ../frontend
npx http-server -p 3000
```
Open `http://localhost:3000` in your browser.

Click "🚀 Get Started" to proceed to the register/login and analyzer pages.

---

## 🧪 Testing with a Sample Resume

### 📝 Generate Test PDF

If you have `REsume.txt` (plain text), you can create a PDF to test:

#### **📌 Step 1: Create resume text file**

```bash
cd backend/uploads
```

Create REsume.txt with your resume content.

Example:
```code
JOHN DOE
Senior Software Developer
john.doe@email.com | (555) 123-4567

PROFESSIONAL SUMMARY
Experienced full-stack developer with 5+ years of expertise in building scalable applications using Python, JavaScript, and AWS cloud services.

TECHNICAL SKILLS
Languages: Python, JavaScript, Java, SQL
Frameworks: React, Node.js, Django, Flask
Cloud & DevOps: AWS (EC2, S3, Lambda), Docker, Kubernetes
Databases: PostgreSQL, MongoDB, MySQL

PROFESSIONAL EXPERIENCE

Senior Developer - Tech Solutions Inc. (2021 - Present)
- Led development of microservices architecture using Docker and Kubernetes
- Optimized database queries improving API response time by 50%
- Managed AWS infrastructure including EC2 instances and S3 buckets

EDUCATION
Bachelor of Science in Computer Science (2019)
```

---

#### **📌 Step 2: Generate PDF from text**
```bash
cd ..
npm install pdfkit
node generate_pdf.js
```

✅ **Expected Output:**

```code
🔄 Starting PDF generation...
📄 Read resume text (1245 characters)
✅ PDF generated successfully!
📦 File: C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\backend\uploads\test_resume.pdf
📊 Size: 3847 bytes
📅 Created: 4/2/2026, 9:15:30 AM

🔍 Next step: Run "node verify_pdf.js" to validate
```

---

#### **📌 Step 3: Verify PDF is valid**
```bash
node verify_pdf.js
```

✅ **Expected Output:**

```code
============================================================
🔍 PDF VERIFICATION SCRIPT (Fixed)
============================================================

STEP 1️⃣  - File Existence Check
✅ File found: test_resume.pdf

STEP 2️⃣  - File Size Check
✅ File size is valid (3847 bytes)

STEP 3️⃣  - PDF Header Validation
✅ Valid PDF header detected (version 1.3)

STEP 4️⃣  - PDF Structure Check
   Has EOF marker: ✅
   Has Catalog: ✅
   Has Pages: ✅

STEP 5️⃣  - PDF Content Parsing
✅ PDF PARSED SUCCESSFULLY!

📋 PDF METADATA:
   Pages: 1
   Text length: 1234 characters
   Producer: PDFKit

📝 EXTRACTED TEXT PREVIEW:
RESUME
JOHN DOE
Senior Software Developer
john.doe@email.com | (555) 123-4567...

============================================================
✅ PDF VERIFICATION COMPLETE - ALL CHECKS PASSED!
✨ Your PDF is ready for use with the API
```

⚠️ If errors occur: The script will provide diagnostic information and solutions.

---

## 🔌 Test via API (Command Prompt)

### 🖥️ Terminal 1 — Start Backend
```cmd
cd C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\backend
npm start
```
✅ **Expected Output:**
```code
Resume analyzer listening on http://localhost:8000 (mode: OpenAI enabled)
```
Keep this terminal open! 🟢

---

### 🖥️ Terminal 2 — Test Endpoints

Open a **NEW** Command Prompt window.

### 🏥 Test 1 — Health Check

```cmd
cd C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\backend
curl http://localhost:8000/api/health
```

✅ **Expected Response:**

```json
{"status":"Backend running (OpenAI mode)","timestamp":"2026-04-02T09:30:45.123Z"}
```

---

### 📋 Test 2 — Analyze Resume

```cmd
curl -F "file=@C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\backend\uploads\test_resume.pdf" http://localhost:8000/api/resume/analyze
```

✅ **Expected Response:**

```json
{
  "result": {
    "score": 78,
    "suggestions": "Add clear contact details (email and phone) at the top. Use stronger action verbs.",
    "keywords": "python, aws, docker, javascript, react, node.js, sql, postgresql",
    "improved_resume": "Summary: Experienced full-stack software developer with 5+ years of expertise in building scalable applications using Python, JavaScript, and AWS...",
    "provider": "openai"
  }
}
```

---

### 🎯 Test 3 — ATS Gap Analysis

```cmd
curl -F "file=@C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\backend\uploads\test_resume.pdf" -F "jd=We are looking for a Full Stack Developer with 5+ years experience. Required: Python, AWS, Docker, React, Node.js. Nice to have: Kubernetes, Machine learning." http://localhost:8000/api/resume/gap-analyze
```

✅ **Expected Response:**

```json
{
  "result": {
    "jdKeywords": [
      "full", "stack", "developer", "python", "aws", "docker", "react", "node.js", "kubernetes", "machine", "learning"
    ],
    "matchedKeywords": [
      "python", "aws", "docker", "react", "node.js"
    ],
    "missingKeywords": [
      "kubernetes", "machine", "learning"
    ],
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

---

## 🌐 Test via Browser

### 🪜 Steps 

**1️⃣ 🖥️ Terminal 3 — Start the frontend** :

```cmd
cd C:\Users\ADMIN\OneDrive\Desktop\ai-resume-improver\frontend
npx http-server -p 3000
```

**2️⃣ Open your web browser and go to:**

```
http://localhost:3000/analyzer.html
```

**3️⃣ Upload Resume PDF:**

- Click **"Choose File"** button
- Navigate to `backend/uploads/`
- Select `test_resume.pdf`
- Click **"Open"**

**4️⃣ Paste Job Description:**

Click in the textarea labeled **"Paste Job Description (JD) here"** and paste the following:

```
We are looking for a Full Stack Developer with the following qualifications:

REQUIRED SKILLS:
- 5+ years of professional development experience
- Strong expertise in Python and JavaScript
- Experience with AWS cloud services and Docker
- Knowledge of microservices architecture
- Experience with React and Node.js frameworks
- Database experience (PostgreSQL, MongoDB)
- CI/CD pipeline implementation

RESPONSIBILITIES:
- Develop scalable web applications
- Build and maintain RESTful APIs
- Manage cloud infrastructure on AWS
- Implement Docker containers and orchestration
- Collaborate with team members
- Optimize application performance

NICE TO HAVE:
- Kubernetes experience
- Machine learning knowledge
- DevOps practices experience
```

**5️⃣** Click **"ATS Gap Analyze (Resume vs JD)"** button

**6️⃣** Wait **5–10 seconds** for the API to process

---

### 📊 View Results

You should see a detailed report showing:

- 🔑 **JD Keywords** — All important skills from the job description
- ✅ **Matched Keywords** — Skills present in BOTH resume and job description (highlighted)
- ❗ **Missing Keywords** — Skills needed for the job but NOT in the resume
- 📍 **Section Analysis** — Score and evaluation for each resume section
- 💡 **Recommendations** — Specific suggestions to improve resume alignment

### 🖥️ Example Browser Output

```
🔑 JD Keywords
python, javascript, aws, docker, react, node.js, postgresql, mongodb, kubernetes, microservices

✅ Matched Keywords
python, aws, docker, react, node.js

❗ Missing Keywords
kubernetes, microservices, mongodb, devops

📍 Section Analysis
MAIN Section
Score: 85
Matched keywords: python, aws, docker, react, node.js
Suggestions: Add Kubernetes and microservices experience

💡 Recommendations
- Add the following keywords from the JD: kubernetes, microservices, mongodb, devops
- Consider adding DevOps and cloud architecture experience to strengthen your profile
- Your resume has strong alignment with the job description - Good match!
```

---

## 🔧 Modes & Environment Variables

The backend auto-detects mode:

- 🤖 If `OPENAI_API_KEY` is present (and `openai` package is installed), it attempts to use OpenAI.
- 🟢 If OpenAI is not available or fails, or if `OPENAI_API_KEY` is absent, the backend runs the local heuristic analyzer.

**⚙️ Important env variables:**
- `PORT` (default 8000)
- `NODE_ENV`
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (optional, default: gpt-3.5-turbo)
- `PROVIDER` (optional; `auto`, `heuristic`, or `openai` — if you want to force behavior)

📄 Example `.env` (heuristic-only):
```
PORT=8000
NODE_ENV=development
PROVIDER=heuristic
```

📄 Example `.env` (OpenAI enabled):
```
PORT=8000
NODE_ENV=development
PROVIDER=auto
OPENAI_API_KEY=sk-REPLACE_WITH_YOUR_KEY
OPENAI_MODEL=gpt-3.5-turbo
```

---

## 🐛 Troubleshooting

### ❌ "bad XRef entry" or `pdf-parse` errors
> 🔍 **Cause:** The PDF may be corrupted or generated poorly (image-only / scanned PDF).  
> ✅ **Fix:** Regenerate the PDF from Word/Google Docs or convert the text file using `generate_pdf.js`.  
> 💡 **Note:** If you need OCR (scanned PDFs), add a Tesseract OCR step — open an issue for instructions.

---

### 🔗 Backend not reachable from frontend
> 🔍 **Cause:** Backend may not be running, or the URL is misconfigured.  
> ✅ **Fix 1:** Ensure backend is running: `cd backend && npm start`  
> ✅ **Fix 2:** Confirm `API_URL` in `analyzer.html` matches the backend host/port (default: `http://127.0.0.1:8000`)  
> ⚠️ **Note:** If serving frontend via `file://`, some fetch calls may fail — use a static server instead.

---

### 🔐 Signup / login not working
> 🔍 **Cause:** Demo app uses browser `localStorage` for local-only authentication.  
> ✅ **Fix:** Credentials are saved under `username` and `password` keys. Check DevTools Console (`F12`) for logs.  
> ⚠️ **Note:** Ensure filenames are lowercase (`register.html`, `gmail.html`, `analyzer.html`) to avoid case-sensitivity issues on servers.

---

### 📄 PDF contains no readable text
> 🔍 **Cause:** Likely an image-only PDF (scanned document) with no selectable text layer.  
> ✅ **Fix:** Use OCR to extract text, or re-save the document as a proper PDF with selectable text.

---

## 🔒 Security

- 🚨 **Never** store API keys in public repositories. Use `.env` and add it to `.gitignore`.
- ⚠️ The demo login is client-side only (localStorage) and is **NOT secure for production**. For production, implement server-side authentication & secure storage.
- 🔄 Rotate any keys accidentally exposed immediately.

---

## 🤝 Contribution

1️⃣ Fork the repository

2️⃣ Create a feature branch

3️⃣ Open a pull request with a clear description of changes

❓ Please open issues for bugs or feature requests.

---
