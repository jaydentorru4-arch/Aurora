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

  // Determine Grounding tool (Google Maps vs Google Search)
  // Per Gemini guidelines: googleMaps and googleSearch cannot be used simultaneously in the same request.
  // Gated to explicit search / map intent to prevent multi-second lookup delays on standard questions
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() || '';
  let tools: any[] | undefined = undefined;

  if (
    req.body.tool === 'maps' ||
    /^(search maps|find on maps|places near|directions to|where is the nearest)/i.test(lastUserMsg)
  ) {
    tools = [{ googleMaps: {} }];
  } else if (
    req.body.tool === 'search' ||
    /^(search google|search web|google search|latest news on|current weather in)/i.test(lastUserMsg)
  ) {
    tools = [{ googleSearch: {} }];
  }

  const generateConfig: any = {
    systemInstruction,
    temperature: intensity === 'creative' ? 0.9 : intensity === 'calm' ? 0.5 : 0.7,
    topP: 0.95,
  };

  if (tools) {
    generateConfig.tools = tools;
  } else {
    // Disable thinking pauses for near-instant first-token streaming
    generateConfig.thinkingConfig = { thinkingBudget: 0 };
  }

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

              // Extract Grounding metadata if available
              const grounding = chunk.candidates?.[0]?.groundingMetadata;
              if (grounding?.groundingChunks) {
                const sources = grounding.groundingChunks
                  .map((c: any) => ({
                    title: c.web?.title || c.maps?.title || 'Source',
                    uri: c.web?.uri || c.maps?.uri || '',
                  }))
                  .filter((c: any) => !!c.uri);

                if (sources.length > 0) {
                  res.write(`data: ${JSON.stringify({ grounding: sources })}\n\n`);
                }
              }
            }
            streamSuccess = true;
            break;
          } catch (mErr: any) {
            lastStreamError = mErr;
            console.warn(`Model ${model} stream attempt ${attempt + 1} error:`, mErr?.message || mErr);
            if (attempt === 0) {
              await sleep(150);
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

// Voice Speech Synthesis Endpoint using model gemini-3.8-flash-lite-tts (voice: Kore)
app.post('/api/tts', async (req, res) => {
  const { text, voice = 'Kore' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for TTS.' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
    });
  }

  // Strip excessive markdown formatting for natural voice playback
  const spokenText = text
    .replace(/```[\s\S]*?```/g, ' [code block omitted] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_~#]/g, '')
    .trim();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [{ text: spokenText.slice(0, 450) }],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio generated by model.' });
    }

    return res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
      model: 'gemini-3.8-flash-lite-tts',
      voice: voice || 'Kore',
    });
  } catch (err: unknown) {
    console.error('Error in /api/tts:', err);
    let message = 'Unable to synthesize speech.';
    if (err instanceof Error) message = err.message;
    return res.status(500).json({ error: message });
  }
});

// High-speed Image Generation Endpoint
app.post('/api/generate-image', async (req, res) => {
  const { prompt, aspectRatio = '1:1', style = 'anime' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required for image generation.' });
  }

  const dimensionsMap: Record<string, { width: number; height: number }> = {
    '1:1': { width: 1024, height: 1024 },
    '16:9': { width: 1280, height: 720 },
    '9:16': { width: 720, height: 1280 },
    '4:3': { width: 1024, height: 768 },
    '3:4': { width: 768, height: 1024 },
  };

  const dims = dimensionsMap[aspectRatio] || dimensionsMap['1:1'];
  const enhancedPrompt = `${prompt}, ${
    style === 'anime'
      ? 'masterpiece anime digital artwork, cinematic vibrant lighting, aesthetic cyberpunk glow, Makoto Shinkai aesthetic, highly detailed'
      : 'masterpiece digital artwork, high resolution, stunning aesthetic composition'
  }`;

  try {
    // 1. Try Gemini image model if available
    if (ai) {
      try {
        const geminiRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite-image',
          contents: enhancedPrompt,
          config: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        });

        const imagePart = geminiRes.candidates?.[0]?.content?.parts?.find(
          (p: any) => p.inlineData && p.inlineData.data
        );

        if (imagePart?.inlineData?.data) {
          const mimeType = imagePart.inlineData.mimeType || 'image/png';
          return res.json({
            imageUrl: `data:${mimeType};base64,${imagePart.inlineData.data}`,
            prompt,
            source: 'gemini-3.1-flash-lite-image',
            aspectRatio,
          });
        }
      } catch (geminiErr: any) {
        // Fall back to high-res neural engine
      }
    }

    // 2. High-speed resilient neural flux image generation engine
    const encoded = encodeURIComponent(enhancedPrompt.slice(0, 300));
    const seed = Math.floor(Math.random() * 9999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${dims.width}&height=${dims.height}&seed=${seed}&nologo=true&model=flux`;

    return res.json({
      imageUrl: pollinationsUrl,
      prompt,
      source: 'neural-flux-generator',
      aspectRatio,
      width: dims.width,
      height: dims.height,
    });
  } catch (err: any) {
    console.error('Image generation error:', err);
    return res.status(500).json({ error: 'Failed to generate image. Please try again.' });
  }
});

// Audio Transcription Endpoint using model gemini-3.5-transcribe
app.post('/api/transcribe', async (req, res) => {
  const { audioData, mimeType = 'audio/webm', prompt } = req.body;

  if (!audioData) {
    return res.status(400).json({ error: 'audioData (base64 encoded audio) is required.' });
  }

  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.',
      hint: 'Please configure GEMINI_API_KEY in your environment or Secrets panel.',
    });
  }

  try {
    // Strip codec parameters from mimeType if present (e.g. 'audio/webm;codecs=opus' -> 'audio/webm')
    const cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim();

    const audioPart = {
      inlineData: {
        mimeType: cleanMimeType,
        data: audioData,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          { text: prompt || 'Transcribe this audio recording accurately and verbatim. Return only the transcription without commentary.' },
        ],
      },
    });

    const transcript = response.text || '';
    return res.json({
      transcript: transcript.trim(),
      model: 'gemini-3.5-transcribe',
      mimeType: cleanMimeType,
    });
  } catch (err: unknown) {
    console.error('Error in /api/transcribe with gemini-3.5-transcribe:', err);
    let message = 'Unable to transcribe audio with gemini-3.5-transcribe.';
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
    return res.status(500).json({ error: message, model: 'gemini-3.5-transcribe' });
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
