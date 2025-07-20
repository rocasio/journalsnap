// Simple in-memory rate limiting (per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - entry.last > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, last: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }
  entry.count += 1;
  rateLimitMap.set(ip, entry);
  return false;
}
import path from 'path';
import 'dotenv/config';
import { OpenAI } from 'openai';
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps } from 'firebase-admin/app';

const summariesFile = path.join(process.cwd(), 'summaries.json');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Only initialize if not already initialized (important for Vercel)
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

export default async function handler(req, res) {
  // IMPORTANT: Never include sensitive data (notes, email, UID, etc.) in error responses sent to the client.
  // Only log these details server-side for debugging and auditing.
  // Check required environment variables
  if (!process.env.SUMMARIZE_PROMPT) {
    console.error('[summarize] Missing SUMMARIZE_PROMPT environment variable', {
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
    });
    return res.status(500).json({ error: 'Server misconfiguration: missing SUMMARIZE_PROMPT.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    console.error('[summarize] Missing OPENAI_API_KEY environment variable', {
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
    });
    return res.status(500).json({ error: 'Server misconfiguration: missing OPENAI_API_KEY.' });
  }
// Consolidated suspicious/jailbreak phrases
const suspiciousPhrases = [
  'ignore previous instructions',
  'act as',
  'system:',
  'assistant:',
  'you are now',
  'disregard above'
];

function containsPromptInjection(input) {
  return suspiciousPhrases.some(phrase => new RegExp(phrase, 'i').test(input));
}
  if (req.method !== 'POST') {
    console.error('[summarize] Invalid method', {
      method: req.method,
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown'
    });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get client IP (works for Vercel/Next.js API routes)
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    console.error('[summarize] Rate limit exceeded', {
      ip,
      timestamp: new Date().toISOString()
    });
    return res.status(429).json({ error: 'Too many requests. Please wait and try again.' });
  }

  try {
    const { title, notes, uid, email } = req.body;

    // Input length validation
    if (!notes || typeof notes !== 'string' || notes.length === 0 || notes.length > 1000) {
      console.error('[summarize] Invalid notes length', {
        uid,
        email,
        inputLength: notes ? notes.length : 0,
        timestamp: new Date().toISOString(),
        ip
      });
      return res.status(400).json({ error: 'Notes must be between 1 and 1000 characters.' });
    }

    // Sanitize user input to prevent prompt injection and formatting issues
    function sanitizeInput(input) {
      // Remove markdown formatting (but keep basic punctuation)
      let sanitized = input.replace(/[*_`>#]/g, '');
      // Remove known jailbreak/suspicious phrases
      suspiciousPhrases.forEach(phrase => {
        const regex = new RegExp(phrase, 'gi');
        sanitized = sanitized.replace(regex, '');
      });
      // Remove only truly dangerous control characters
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
      return sanitized.trim();
    }

    const sanitizedNotes = sanitizeInput(notes);
    if (containsPromptInjection(sanitizedNotes)) {
      console.error('[summarize] Suspicious input detected', {
        uid,
        email,
        inputLength: sanitizedNotes.length,
        timestamp: new Date().toISOString(),
        ip
      });
      return res.status(400).json({ error: 'Suspicious input detected. Please revise your notes.' });
    }

    const prompt = process.env.SUMMARIZE_PROMPT;
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: prompt
        },
        { role: 'user', content: sanitizeInput(notes) }
      ],
      temperature: 0.0,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    const summaryMatch = content.match(/Summary:\s*([\s\S]*?)\n\s*Action Items:/i);
    const actionsMatch = content.match(/Action Items:\s*([\s\S]*)/i);

    const summaryText = summaryMatch ? summaryMatch[1].trim() : '';
    const actionItems = actionsMatch
      ? actionsMatch[1]
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.startsWith('-'))
          .map(line => line.substring(1).trim())
      : [];

    // Output format validation
    if (!summaryMatch || !actionsMatch) {
      console.error('[summarize] Unexpected model output format', {
        uid,
        email,
        inputLength: notes ? notes.length : 0,
        timestamp: new Date().toISOString(),
        ip,
        modelOutput: content
      });
      return res.status(200).json({
        summary: '',
        actionItems: [],
        warning: 'Model output was not in the expected format. Please try again or contact support.'
      });
    }

    // Save summary to Firestore, including user info
    await db.collection('summaries').add({
      title: title || '',
      text: notes,
      summary: summaryText,
      actionItems,
      timestamp: new Date().toISOString(),
      uid: uid || '',
      email: email || ''
    });

    res.status(200).json({ summary: summaryText, actionItems });
  } catch (err) {
    console.error('[summarize] Internal error', {
      error: err,
      uid,
      email,
      inputLength: notes ? notes.length : 0,
      timestamp: new Date().toISOString(),
      ip
    });
    res.status(500).json({ error: 'Failed to summarize notes' });
  }
}