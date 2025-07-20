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
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { title, notes, uid, email } = req.body;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
      You are a transformation engine.  
      • Input: raw meeting or journal notes.  
      • Output:  
        1) A single‑paragraph **Summary** of only what was said.  
        2) A bullet‑list of **Action Items** extracted directly from the notes.  
      Do NOT add any commentary, explanations, or suggestions beyond those two sections.  
      Respond in the exact format:
      
      Summary:
      <one concise paragraph>
      
      Action Items:
      - Item 1
      - Item 2
      `
          },
          { role: 'user', content: notes }
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
    console.error(err);
    res.status(500).json({ error: 'Failed to summarize notes' });
  }
}