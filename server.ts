import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Init Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // API route for AI question drafting
  app.post('/api/draft-questions', async (req, res) => {
    try {
      const { topic, difficulty, count = 3 } = req.body;
      
      const prompt = `You are an expert exam setter for the board exam (LET). 
Create ${count} multiple choice questions about "${topic}" at a ${difficulty} difficulty level.
Return JSON ONLY, matching exactly this format:
[
  {
    "stem": "The question text?",
    "options": [
      { "id": "A", "text": "Option A" },
      { "id": "B", "text": "Option B" },
      { "id": "C", "text": "Option C" },
      { "id": "D", "text": "Option D" }
    ],
    "correctOptionId": "A",
    "explanation": "Why this is correct."
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || "[]";
      // Find JSON block
      const jsonStr = text.replace(/```(?:json)?\n?/g, '').split('```')[0].trim();
      const parsed = JSON.parse(jsonStr);
      
      res.json({ success: true, questions: parsed });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
