// backend/server.js
// Resume analyzer with optional OpenAI + heuristic fallback
// Added: /api/resume/gap-analyze route for ATS Gap Analysis (Resume vs JD)
// FIXED: Improved error handling in gap-analyze route

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

/* -------------------------
   Heuristic Analyzer (local)
   ------------------------- */

function safeTrim(s) { return (s || '').toString().trim(); }

const TECH_KEYWORDS = [
  'javascript','java','python','c++','c#','react','angular','vue','node.js','node',
  'express','spring','django','flask','sql','postgresql','mysql','mongodb','aws',
  'azure','gcp','docker','kubernetes','git','rest api','graphql','html','css',
  'typescript','php','ruby','go','tensorflow','pytorch','machine learning',
  'nlp','data analysis','etl','spark','hadoop','linux','ci/cd','jest','pytest'
].map(k => k.toLowerCase());

function analyzeResumeText(text) {
  const t = text.replace(/\r/g, '\n');
  const lower = t.toLowerCase();

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(t);
  const hasPhone = /(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/.test(t);
  const hasSummary = /\b(summary|professional summary|profile|overview)\b/i.test(lower);
  const hasExperience = /\b(experience|work experience|professional experience|employment)\b/i.test(lower);
  const hasEducation = /\b(education|academic|degree|bachelor|master|b.sc|bachelor of)\b/i.test(lower);
  const hasSkills = /\b(skills|technical skills|areas of expertise)\b/i.test(lower);

  const actionVerbs = ['led','managed','developed','designed','implemented','improved','reduced','increased','built','created','automated','optimized','delivered','launched','engineered','resolved'];
  let actionVerbCount = 0;
  for (const v of actionVerbs) {
    const re = new RegExp('\\b' + v + '\\b', 'gi');
    const m = t.match(re);
    if (m) actionVerbCount += m.length;
  }

  const measurableMatches = t.match(/\b\d+%|\b\d+\s+(years?|yrs?|months?)\b|\$\d+[kKmM]?/gi) || [];
  const measurableCount = measurableMatches.length;

  const bulletCount = (t.match(/(^|\n)[\s\t]*[-•*]/g) || []).length;

  const foundKeywords = [];
  for (const k of TECH_KEYWORDS) {
    if (lower.includes(k)) foundKeywords.push(k);
  }

  // Score heuristics (0-100)
  let score = 50;
  if (hasEmail && hasPhone) score += 10;
  if (hasSummary) score += 8;
  if (hasExperience) score += 12;
  if (hasEducation) score += 5;
  if (hasSkills) score += 5;
  score += Math.min(10, actionVerbCount * 2);
  if (measurableCount > 0) score += 10;
  if (bulletCount >= 3) score += 5;
  score += Math.min(10, Math.floor(foundKeywords.length / 3));
  score = Math.max(0, Math.min(100, Math.round(score)));

  const suggestions = [];
  if (!hasEmail || !hasPhone) suggestions.push('Add clear contact details (email and phone) at the top.');
  if (!hasSummary) suggestions.push('Add a short professional summary at the top (2–3 sentences).');
  if (!hasSkills) suggestions.push('Add a Skills section listing technologies and tools.');
  if (!hasExperience) suggestions.push('Add detailed work experience entries with role, company, and dates.');
  if (actionVerbCount < 3) suggestions.push('Use stronger action verbs (led, developed, improved, implemented).');
  if (measurableCount === 0) suggestions.push('Whenever possible, add numbers/metrics (e.g., "reduced latency by 30%").');
  if (bulletCount < 3 && hasExperience) suggestions.push('Use bullet points under each role for readability.');
  if (foundKeywords.length < 3) suggestions.push('Include more role-relevant keywords for ATS (look at job descriptions).');
  if (suggestions.length === 0) suggestions.push('Resume structure looks good — consider tailoring to target job descriptions.');

  const uniqueFound = Array.from(new Set(foundKeywords));

  // Improved resume draft
  let firstLines = t.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 12).join(' ').trim();
  let yearsMatch = (t.match(/\b([0-9]+)\s+years?\b/i) || [null, null])[1];
  const yearsText = yearsMatch ? `${yearsMatch}+ years` : 'several years';

  const improvedSummary = hasSummary
    ? `Summary: ${firstLines.substring(0, 220)}`
    : `Summary: Experienced professional with ${yearsText} of experience. Strong background in ${uniqueFound.slice(0,4).join(', ') || 'relevant technologies'}. Focused on delivering measurable results using action-oriented approaches.`;

  const skillsList = uniqueFound.length > 0 ? uniqueFound.slice(0, 30).join(', ') : 'Add a skills section with technologies relevant to the role (e.g., JavaScript, React, Node, SQL).';

  const improved_resume = `${improvedSummary}\n\nContact: ${hasEmail ? (t.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)||[''])[0] : 'Add email'} | ${hasPhone ? (t.match(/(\+?\d{1,3}[\s-]?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}/)||[''])[0] : 'Add phone'}\n\nSkills: ${skillsList}\n\nHighlights: ${measurableMatches.slice(0,5).join('; ') || 'Add measurable achievements (e.g., improved X by 30%).'}\n\nTips applied: ${suggestions.slice(0,4).join(' ')}\n\n(Shortened version — tailor further for the job.)`;

  return {
    score,
    suggestions: suggestions.join(' '),
    keywords: uniqueFound.join(', ') || 'No strong keywords found',
    improved_resume
  };
}

/* -------------------------
   OpenAI Analyzer (if configured)
   ------------------------- */

let useOpenAI = false;
let openaiClient = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    useOpenAI = true;
    console.log('OpenAI key detected — OpenAI mode enabled');
  } catch (err) {
    console.warn('OPENAI_API_KEY is set but openai package could not be loaded. Falling back to heuristic. To enable OpenAI install "openai" package.');
    useOpenAI = false;
  }
} else {
  console.log('No OPENAI_API_KEY detected — running heuristic analyzer only');
}

async function analyzeWithOpenAI(resumeText) {
  // Build prompt instructing JSON output.
  const system = `You are an expert resume reviewer. Analyze the resume text provided and return ONLY valid JSON (no extra commentary) using this exact schema:
{
  "score": <number 0-100>,
  "suggestions": "<three to five concise suggestions>",
  "keywords": "<comma-separated important keywords>",
  "improved_resume": "<a short improved version of the resume content>"
}`;
  const user = `Resume text:\n\n${resumeText}`;

  // Use chat completions (OpenAI SDK interface may vary; this uses "openai" package object)
  try {
    const response = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.6,
      max_tokens: 1200
    });

    const raw = response?.choices?.[0]?.message?.content;
    if (!raw) throw new Error('OpenAI returned empty response');

    // Try parse JSON directly
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // If not pure JSON, try to locate JSON substring
      const jsonMatch = raw.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch (ee) { /* ignore */ }
      }
    }

    if (!parsed) {
      // If cannot parse, return the raw improved text in improved_resume
      return {
        score: null,
        suggestions: null,
        keywords: null,
        improved_resume: raw,
        raw_openai: raw
      };
    }

    // Normalize parsed values
    return {
      score: parsed.score ?? parsed?.score ?? null,
      suggestions: parsed.suggestions ?? parsed?.suggestions ?? '',
      keywords: parsed.keywords ?? parsed?.keywords ?? '',
      improved_resume: parsed.improved_resume ?? parsed?.improved_resume ?? ''
    };

  } catch (err) {
    // bubble up
    throw err;
  }
}

/* -------------------------
   Routes
   ------------------------- */

app.get('/api/health', (req, res) => {
  res.json({ status: useOpenAI ? 'Backend running (OpenAI mode)' : 'Backend running (heuristic mode)', timestamp: new Date().toISOString() });
});

app.post('/api/resume/analyze', upload.single('file'), async (req, res) => {
  let filePath = null;
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);
    if (!fileBuffer || fileBuffer.length === 0) throw new Error('Uploaded file is empty');

    const header = fileBuffer.toString('utf8', 0, 4);
    if (!header.includes('%PDF')) throw new Error('Uploaded file is not a valid PDF');

    let pdfData;
    try {
      pdfData = await pdf(fileBuffer);
    } catch (err) {
      // PDF parse failed — return a helpful error
      throw new Error('PDF parsing failed — the file may be corrupted, encrypted, or image-only. Try regenerating the PDF.');
    }

    const text = safeTrim(pdfData.text || '');
    if (!text) throw new Error('No readable text found in PDF (maybe it is image-only).');

    // Use OpenAI if available; if OpenAI fails, fall back to heuristic
    if (useOpenAI) {
      try {
        const openaiResult = await analyzeWithOpenAI(text);
        // If OpenAI returned null score and no structured fields, but returned a raw string, fallback to heuristic partial merge
        if ((openaiResult.score === null || openaiResult.score === undefined) &&
            (!openaiResult.suggestions && !openaiResult.keywords && openaiResult.improved_resume)) {
          // We'll still try to compute heuristic keywords and score for structured fields,
          // but keep OpenAI's improved_resume text.
          const heuristic = analyzeResumeText(text);
          return res.json({
            result: {
              score: heuristic.score,
              suggestions: heuristic.suggestions,
              keywords: heuristic.keywords,
              improved_resume: openaiResult.improved_resume,
              provider: 'openai_fallback_heuristic'
            }
          });
        }

        return res.json({
          result: {
            score: openaiResult.score ?? null,
            suggestions: openaiResult.suggestions ?? '',
            keywords: openaiResult.keywords ?? '',
            improved_resume: openaiResult.improved_resume ?? '',
            provider: 'openai'
          }
        });
      } catch (openaiErr) {
        console.error('OpenAI call failed, falling back to heuristic:', openaiErr.message || openaiErr);
        // continue to heuristic fallback
      }
    }

    // Heuristic fallback
    const analysis = analyzeResumeText(text);
    return res.json({
      result: {
        ...analysis,
        provider: 'heuristic'
      }
    });

  } catch (err) {
    console.error('Error during analysis:', err.message || err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  } finally {
    // cleanup
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
});

/* -------------------------
   ATS Gap Analysis Route
   /api/resume/gap-analyze
   -------------------------
   FIXED: Improved error handling for malformed PDFs
   ------------------------- */

// Helper utilities for gap analysis
function normalizeText(s = '') {
  return (s || '').toString().replace(/\r/g, '\n').trim();
}

// fallback crude text extraction (when pdf-parse fails)
function crudeExtractTextFromBuffer(buf) {
  try {
    // find runs of printable ASCII characters at least 20 chars long
    const s = buf.toString('utf8');
    const matches = s.match(/[\x20-\x7E]{20,}/g) || [];
    // join and normalize; limit to avoid giant strings
    const joined = matches.join('\n\n').slice(0, 200_000);
    // remove repeated whitespace, keep readable text
    return joined.replace(/\s{2,}/g, ' ').trim();
  } catch (e) {
    return '';
  }
}

function extractKeywordsFromText(text, keywordsList = TECH_KEYWORDS) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const kw of keywordsList) {
    if (lower.includes(kw)) found.add(kw);
  }
  return Array.from(found);
}

function extractFrequentTerms(text, maxTerms = 20) {
  if (!text) return [];
  const stop = new Set(['the','and','for','with','a','an','to','of','in','on','by','as','at','is','are','be','or','that','this','we','you','your','our','will','have','has','role','responsibilities']);
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s\-\/\+\.]/g, ' ').split(/\s+/).filter(Boolean);
  const freq = {};
  for (const t of tokens) {
    if (t.length <= 2 || stop.has(t)) continue;
    freq[t] = (freq[t] || 0) + 1;
  }
  const arr = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, maxTerms).map(e => e[0]);
  return arr;
}

function parseSections(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  const headingRegex = /^\s*(SUMMARY|PROFILE|SKILLS|TECHNICAL SKILLS|EXPERIENCE|WORK EXPERIENCE|PROJECTS|EDUCATION|CERTIFICATIONS|ACHIEVEMENTS|INTERESTS)\b[:\-]?\s*$/i;

  let current = { title: 'MAIN', contentLines: [] };
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i].trim();
    if (headingRegex.test(ln)) {
      if (current.contentLines.length) sections.push({ title: current.title, content: current.contentLines.join('\n') });
      current = { title: ln.toUpperCase(), contentLines: [] };
    } else {
      current.contentLines.push(lines[i]);
    }
  }
  if (current.contentLines.length) sections.push({ title: current.title, content: current.contentLines.join('\n') });
  return sections;
}

function analyzeSection(sectionText, jdKeywords) {
  const t = sectionText || '';
  const lower = t.toLowerCase();
  const actionVerbs = ['led','managed','developed','designed','implemented','improved','reduced','increased','built','created','automated','optimized','delivered','launched','engineered','resolved'];
  let actionCount = 0;
  for (const v of actionVerbs) {
    const re = new RegExp('\\b' + v + '\\b', 'gi');
    const m = t.match(re);
    if (m) actionCount += m.length;
  }
  const meas = (t.match(/\b\d+%|\b\d+\s+(years?|yrs?|months?)\b|\$\d+[kKmM]?/gi) || []).length;
  const bullets = (t.match(/(^|\n)[\s\t]*[-•*]/g) || []).length;
  const keywordsFound = jdKeywords.filter(k => lower.includes(k));
  const score = Math.max(0, Math.min(100,
    30 * (keywordsFound.length > 0 ? 1 : 0) +
    Math.min(20, actionCount * 4) +
    Math.min(25, meas * 6) +
    Math.min(25, Math.min(10, bullets) * 2.5)
  ));
  const weak = score < 45;
  const suggestions = [];
  if (keywordsFound.length === 0) suggestions.push('Add role-relevant keywords/technologies in this section.');
  if (actionCount < 2) suggestions.push('Use stronger action verbs and active statements.');
  if (meas === 0) suggestions.push('Add measurable achievements where possible (numbers, %).');
  if (bullets < 2) suggestions.push('Use bullet points for clarity.');
  return {
    score,
    weak,
    keywordsFound,
    actionCount,
    measurableCount: meas,
    bulletCount: bullets,
    suggestions
  };
}

app.post('/api/resume/gap-analyze', upload.single('file'), async (req, res) => {
  let filePath = null;
  try {
    const jdText = (req.body && req.body.jd) ? req.body.jd.toString() : '';
    if (!jdText) return res.status(400).json({ error: 'Missing job description (field "jd") in request body' });

    let resumeText = '';
    if (req.file && req.file.path) {
      filePath = req.file.path;
      const buf = fs.readFileSync(filePath);
      
      // Validate file size
      if (!buf || buf.length === 0) {
        return res.status(400).json({ error: 'Uploaded file is empty' });
      }
      
      let pdfData = null;
      
      try {
        // Try the normal PDF parser first
        pdfData = await pdf(buf);
        resumeText = normalizeText(pdfData.text || '');
        
        // If pdf-parse returned very little text, try crude fallback
        if (!resumeText || resumeText.length < 20) {
          const crude = crudeExtractTextFromBuffer(buf);
          if (crude && crude.length > resumeText.length) {
            resumeText = normalizeText(crude);
          }
        }
      } catch (pdfErr) {
        // PDF parsing failed; attempt crude extraction as fallback
        console.warn('pdf-parse failed in gap-analyze, attempting crude extraction:', pdfErr && pdfErr.message ? pdfErr.message : pdfErr);
        const crude = crudeExtractTextFromBuffer(buf);
        resumeText = normalizeText(crude || '');
        
        // If even crude extraction fails, return helpful error
        if (!resumeText || resumeText.length < 30) {
          return res.status(400).json({ 
            error: 'Could not extract readable text from PDF. The file may be corrupted, encrypted, image-only, or not a valid PDF. Solutions: (1) Re-export the PDF from your document source, (2) Use a different PDF viewer to export, (3) Paste plain text in resumeText field instead, or (4) Try the /api/resume/analyze endpoint first to verify the PDF.' 
          });
        }
      }
    } else if (req.body && req.body.resumeText) {
      resumeText = normalizeText(req.body.resumeText);
    } else {
      return res.status(400).json({ error: 'No resume provided (upload "file" PDF or "resumeText" field)' });
    }

    // Ensure we have resume content
    if (!resumeText || resumeText.length < 30) {
      return res.status(400).json({ error: 'Resume text is too short to analyze. Please provide a longer resume.' });
    }

    const jdNormalized = normalizeText(jdText);

    // JD keywords: tech keywords present + frequent terms extracted from JD
    const jdTech = extractKeywordsFromText(jdNormalized, TECH_KEYWORDS);
    const jdFreq = extractFrequentTerms(jdNormalized, 40);
    const jdKeywords = Array.from(new Set([...jdTech, ...jdFreq])).slice(0, 60);

    // Resume keywords & matching
    const resumeLower = (resumeText || '').toLowerCase();
    const matched = jdKeywords.filter(k => resumeLower.includes(k));
    const missing = jdKeywords.filter(k => !resumeLower.includes(k));

    // section analysis
    const sectionsRaw = parseSections(resumeText);
    const sections = (sectionsRaw.length > 0 ? sectionsRaw : [{ title: 'RESUME', content: resumeText }]).map(sec => {
      const sa = analyzeSection(sec.content, jdKeywords);
      return {
        title: sec.title || 'SECTION',
        contentPreview: sec.content.slice(0, 600),
        ...sa
      };
    });

    const recommendations = [];
    if (missing.length > 0) recommendations.push(`Add the following keywords from the JD: ${missing.slice(0,20).join(', ')}`);
    if (sections.filter(s => s.weak).length > 0) recommendations.push('Improve weak sections: ' + sections.filter(s => s.weak).map(s => s.title).join(', '));
    if (matched.length === 0) recommendations.push('Resume has few direct matches to the JD — tailor resume to the JD keywords and responsibilities.');

    res.json({
      result: {
        jdKeywords,
        matchedKeywords: matched,
        missingKeywords: missing,
        sections,
        recommendations
      }
    });

  } catch (err) {
    console.error('gap analyze error:', err);
    res.status(500).json({ error: 'Gap analysis failed: ' + (err.message || err) });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch(e) { /* ignore */ }
    }
  }
});

/* -------------------------
   Start server
   ------------------------- */

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Resume analyzer listening on http://localhost:${PORT} (mode: ${useOpenAI ? 'OpenAI enabled' : 'heuristic'})`);
});