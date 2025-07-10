import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const summariesFile = path.join(__dirname, 'summaries.json');

app.get('/summaries', (req, res) => {
  if (!fs.existsSync(summariesFile)) {
    return res.json([]);
  }
  try {
    const data = fs.readFileSync(summariesFile, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Failed to parse summaries.json:', err);
    res.status(500).json({ error: 'Failed to parse summaries.json. Please ensure the file contains valid JSON.' });
  }
});

app.post('/api/summarize', async (req, res) => {
  try {
    const { notes } = req.body;
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

      // Extract the Summary and Action Items
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

      res.json({ summary: summaryText, actionItems });

      saveSummary({
        text: notes,
        summary: summaryText,
        actionItems
      });

  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

function saveSummary(record) {
  const existing = fs.existsSync(summariesFile)
    ? JSON.parse(fs.readFileSync(summariesFile, 'utf-8'))
    : [];

  existing.push({
    ...record,
    timestamp: new Date().toISOString()
  });

  fs.writeFileSync(summariesFile, JSON.stringify(existing, null, 2));
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy listening on http://localhost:${port}`));