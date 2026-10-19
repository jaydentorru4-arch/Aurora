import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY environment variable is not configured.',
      hint: 'Add GEMINI_API_KEY to your Vercel Environment Variables.'
    });
  }

  const { messages, personality } = req.body || {};
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

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

  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: intensity === 'creative' ? 0.95 : intensity === 'calm' ? 0.6 : 0.8,
        topP: 0.95,
      },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    return res.end();
  } catch (err: unknown) {
    let message = 'Unable to reach Aurora AI service.';
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error?.message) {
          message = parsed.error.message;
        } else {
          message = err.message;
        }
      } catch {
        message = err.message;
      }
    }
    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    }
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    return res.end();
  }
}
