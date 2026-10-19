import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Health / Status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    model: 'gemini-3.8-flash',
  });
});

// Real-time Chat Streaming Endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, personality, stream = true } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      hint: 'Please configure GEMINI_API_KEY in your environment or Secrets panel.',
    });
  }

  // Construct dynamic personality system instruction
  const style = personality?.responseStyle || 'balanced';
  const intensity = personality?.intensity || 'playful';
  const userName = personality?.userName?.trim() || 'Kouhai';

  const styleDirectives: Record<string, string> = {
    balanced: 'Provide well-balanced responses with natural conversational flow and clear structure.',
    concise: 'Keep responses crisp, punchy, and direct to the point. Avoid fluff.',
    detailed: 'Provide deep, comprehensive, and thoroughly reasoned explanations with examples.',
    creative: 'Be imaginative, evocative, and playful with storytelling flair and vibrant analogies.',
  };

  const intensityDirectives: Record<string, string> = {
    calm: 'Maintain a composed, serene, and grounded senpai presence. Gentle and supportive.',
    playful: 'Be witty, teasing, and charming. Use mild playful banter, clever anime/pop-culture analogies when fitting.',
    expressive: 'Be animated, lively, and enthusiastic with dramatic flair and vibrant emotional range.',
  };

  const systemInstruction = [
    `You are Aurora: a clever, confident, warm, playful, and genuinely intelligent Japanese senpai AI companion.`,
    `You have deep expertise in anime, tech, software engineering, streetwear fashion, philosophy, and real-life guidance.`,
    `Personality Directive: ${intensityDirectives[intensity] || intensityDirectives.playful}`,
    `Style Directive: ${styleDirectives[style] || styleDirectives.balanced}`,
    `The user you are mentoring/conversing with is named "${userName}". Address them naturally (or as Kouhai when teasing affectionately).`,
    `Always respond in clean Markdown with appropriate headings, lists, inline code, or syntax-highlighted code blocks when helpful.`,
    `Never break character. Never state you are an AI language model from Google; you are Aurora.`,
  ].join('\n');

  // Format messages into contents array for Gemini
  // Normalize roles: 'user' | 'model'
  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const generateConfig = {
    systemInstruction,
    temperature: intensity === 'creative' ? 0.95 : intensity === 'calm' ? 0.6 : 0.8,
    topP: 0.95,
  };

  const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest'];

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let streamSuccess = false;
      let lastStreamError: any = null;

      for (const model of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const responseStream = await ai.models.generateContentStream({
              model,
              contents,
              config: generateConfig,
            });

            for await (const chunk of responseStream) {
              const text = chunk.text;
              if (text) {
                res.write(`data: ${JSON.stringify({ text })}\n\n`);
              }
            }
            streamSuccess = true;
            break;
          } catch (mErr: any) {
            lastStreamError = mErr;
            console.warn(`Model ${model} stream attempt ${attempt + 1} error:`, mErr?.message || mErr);
            if (attempt === 0) {
              await sleep(600);
            }
          }
        }
        if (streamSuccess) break;
      }

      if (!streamSuccess) {
        throw lastStreamError || new Error('All models unavailable');
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      let responseSuccess = false;
      let lastErr: any = null;
      let finalResponse: any = null;

      for (const model of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            finalResponse = await ai.models.generateContent({
              model,
              contents,
              config: generateConfig,
            });
            responseSuccess = true;
            break;
          } catch (mErr: any) {
            lastErr = mErr;
            console.warn(`Model ${model} generate attempt ${attempt + 1} error:`, mErr?.message || mErr);
            if (attempt === 0) {
              await sleep(600);
            }
          }
        }
        if (responseSuccess && finalResponse) break;
      }

      if (!responseSuccess || !finalResponse) {
        throw lastErr || new Error('All models unavailable');
      }

      return res.json({ text: finalResponse.text || '' });
    }
  } catch (err: unknown) {
    console.error('Error in /api/chat:', err);
    let message = 'Unable to reach Aurora AI service.';
    if (err instanceof Error) {
      message = err.message;
      try {
        const jsonMatch = err.message.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed?.error?.message) {
            message = parsed.error.message;
          } else if (parsed?.message) {
            message = parsed.message;
          }
        }
      } catch {
        message = err.message;
      }
    }

    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      return res.end();
    }
  }
});

// Setup Vite dev server or static dist serving
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aurora server running at http://0.0.0.0:${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer();
