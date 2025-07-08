import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
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
      
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy listening on http://localhost:${port}`));