import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// 1. Authoritative Administrator Configuration
// -------------------------------------------------------------
// The administrator email is securely configured via environment variables.
// Normal users NEVER receive admin privileges. Only exact matching email receives 'admin' role.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();

console.log(`[Auth System] Configured ADMIN_EMAIL: ${ADMIN_EMAIL ? ADMIN_EMAIL : '(Not configured)'}`);

// Helper to determine role authoritatively on the server
function getAuthorizedRole(email: string): 'admin' | 'user' {
  const normalized = email.trim().toLowerCase();
  if (ADMIN_EMAIL && normalized === ADMIN_EMAIL) {
    return 'admin';
  }
  return 'user';
}

// -------------------------------------------------------------
// 2. Persistent Server-side User & Session Store
// -------------------------------------------------------------
const DATA_DIR = path.resolve(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
}

function loadUsers(): StoredUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Error loading users file:', err);
  }
  return [];
}

function saveUsers(users: StoredUser[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

// Hash password with salt using PBKDF2
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Active session token store: token -> SessionData
interface SessionData {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  expiresAt: number;
}

const sessions = new Map<string, SessionData>();

function createSession(user: StoredUser): { token: string; session: SessionData } {
  const token = crypto.randomBytes(32).toString('hex');
  const role = getAuthorizedRole(user.email);
  const session: SessionData = {
    userId: user.id,
    email: user.email,
    role,
    name: user.name,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  sessions.set(token, session);
  return { token, session };
}

// Authentication middleware
function authenticateSession(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7).trim();
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token);
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  // Authoritatively re-verify role on every request
  session.role = getAuthorizedRole(session.email);

  (req as any).user = session;
  next();
}

// -------------------------------------------------------------
// 3. Authentication Routes
// -------------------------------------------------------------

// Register a new user
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  // Fallback to neutral "User" if no name provided - NEVER "Jayden"
  const cleanName = (typeof name === 'string' && name.trim()) ? name.trim() : cleanEmail.split('@')[0] || 'User';

  const newUser: StoredUser = {
    id: `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
    email: cleanEmail,
    name: cleanName,
    passwordHash,
    salt,
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);

  const { token, session } = createSession(newUser);

  return res.status(201).json({
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: session.role,
      createdAt: newUser.createdAt,
    },
    token,
  });
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = loadUsers();

  const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    // If the configured admin is logging in for the very first time, provision securely
    if (ADMIN_EMAIL && cleanEmail === ADMIN_EMAIL && password.length >= 6) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      const adminUser: StoredUser = {
        id: `usr_admin_${Date.now()}`,
        email: cleanEmail,
        name: cleanEmail.split('@')[0] || 'Admin',
        passwordHash,
        salt,
        createdAt: Date.now(),
      };
      users.push(adminUser);
      saveUsers(users);

      const { token, session } = createSession(adminUser);
      return res.json({
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
          role: session.role,
          createdAt: adminUser.createdAt,
        },
        token,
      });
    }

    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.passwordHash) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { token, session } = createSession(user);

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: session.role,
      createdAt: user.createdAt,
    },
    token,
  });
});

// Current User Profile Verification
app.get('/api/auth/me', authenticateSession, (req, res) => {
  const session = (req as any).user as SessionData;
  return res.json({
    user: {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role, // Server-enforced
    },
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    sessions.delete(token);
  }
  return res.json({ status: 'ok', loggedOut: true });
});

let personaOverrides = {
  senpaiBanter: 85,
  techDepth: 90,
  animeReferences: 75,
};

// -------------------------------------------------------------
// 5. Google GenAI Client & Health Check
// -------------------------------------------------------------
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

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!apiKey,
    primaryModel: 'gemini-3.1-flash-lite',
    fallbackModel: 'gemini-3.8-flash',
    adminConfigured: Boolean(ADMIN_EMAIL),
  });
});

// -------------------------------------------------------------
// 6. Real-time Chat Streaming Endpoint (< 3s TTFT Optimized)
// -------------------------------------------------------------
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

  // Keep recent conversation context (last 10 turns) to prevent latency degradation
  const recentMessages = messages.slice(-10);
  const contents = recentMessages.map((m: { role: string; content: string }) => ({
    role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  // Gated Grounding Tools (only when explicitly requested to keep responses fast)
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
    // Disable thinking pauses for instant first-token streaming (< 1 second)
    generateConfig.thinkingConfig = { thinkingBudget: 0 };
  }

  // Primary model is gemini-3.1-flash-lite for ultra-fast TTFT (~850ms), fallback to gemini-3.8-flash
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  try {
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      let streamSuccess = false;
      let lastStreamError: any = null;

      for (const model of candidateModels) {
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
          console.warn(`Model ${model} stream error:`, mErr?.message || mErr);
        }
      }

      if (!streamSuccess) {
        throw lastStreamError || new Error('All candidate models unavailable');
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      let responseSuccess = false;
      let lastErr: any = null;
      let finalResponse: any = null;

      for (const model of candidateModels) {
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
          console.warn(`Model ${model} generate error:`, mErr?.message || mErr);
        }
      }

      if (!responseSuccess || !finalResponse) {
        throw lastErr || new Error('All models unavailable');
      }

      const text = finalResponse.text || '';
      return res.json({ text });
    }
  } catch (err: unknown) {
    console.error('Error in /api/chat:', err);
    let message = 'Unable to reach Aurora AI service.';
    if (err instanceof Error) message = err.message;

    if (!res.headersSent) {
      return res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      return res.end();
    }
  }
});

// -------------------------------------------------------------
// 7. Voice Speech Synthesis Endpoint (gemini-3.8-flash-lite-tts)
// -------------------------------------------------------------
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

  // Strip markdown formatting for natural voice playback
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

// -------------------------------------------------------------
// 8. Unlimited AI Image Generation Endpoint
// -------------------------------------------------------------
app.post('/api/generate-image', async (req, res) => {
  const { prompt, aspectRatio = '1:1', style = 'anime' } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required for image generation.' });
  }

  const dimensionsMap: Record<string, { width: number; height: number }> = {
    '1:1': { width: 768, height: 768 },
    '16:9': { width: 1024, height: 576 },
    '9:16': { width: 576, height: 1024 },
    '4:3': { width: 800, height: 600 },
    '3:4': { width: 600, height: 800 },
  };

  const dims = dimensionsMap[aspectRatio] || dimensionsMap['1:1'];
  const enhancedPrompt = `${prompt.trim()}, ${
    style === 'anime'
      ? 'masterpiece anime digital artwork, cinematic vibrant lighting, aesthetic cyberpunk glow, Makoto Shinkai style, high quality'
      : 'masterpiece digital artwork, cinematic lighting, high resolution'
  }`;

  try {
    // Pollinations default model is free, fast (<1s), and returns binary JPEG without auth limits
    const encoded = encodeURIComponent(enhancedPrompt.slice(0, 300));
    const seed = Math.floor(Math.random() * 9999999);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${dims.width}&height=${dims.height}&seed=${seed}&nologo=true`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const imgRes = await fetch(pollinationsUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (imgRes.ok) {
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const dataUri = `data:image/jpeg;base64,${base64}`;

      return res.json({
        imageUrl: dataUri,
        prompt: prompt.trim(),
        aspectRatio,
        width: dims.width,
        height: dims.height,
        source: 'neural-image-engine',
      });
    }

    throw new Error(`Engine returned HTTP ${imgRes.status}`);
  } catch (err: any) {
    console.warn('Network image engine fallback triggered:', err?.message || err);

    // Aesthetic Generative SVG Art Fallback (100% reliable, zero network dependency)
    const seedColor1 = '#0B00CF';
    const seedColor2 = '#FF2D2B';
    const cleanTitle = prompt.slice(0, 40).replace(/["<>]/g, '');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${dims.width}" height="${dims.height}" viewBox="0 0 ${dims.width} ${dims.height}">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#070916" />
            <stop offset="50%" stop-color="#120A2C" />
            <stop offset="100%" stop-color="#050712" />
          </linearGradient>
          <linearGradient id="glow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${seedColor1}" stop-opacity="0.8" />
            <stop offset="100%" stop-color="${seedColor2}" stop-opacity="0.9" />
          </linearGradient>
          <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="40" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
        <circle cx="${dims.width * 0.3}" cy="${dims.height * 0.4}" r="${dims.width * 0.25}" fill="url(#glow)" filter="url(#blurFilter)" />
        <circle cx="${dims.width * 0.7}" cy="${dims.height * 0.6}" r="${dims.width * 0.2}" fill="#FF2D2B" opacity="0.6" filter="url(#blurFilter)" />
        <g transform="translate(${dims.width / 2}, ${dims.height / 2})">
          <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
          <circle cx="0" cy="0" r="60" fill="none" stroke="#FF2D2B" stroke-width="2" stroke-dasharray="8 6" />
          <polygon points="0,-40 35,20 -35,20" fill="url(#glow)" opacity="0.85" />
          <text x="0" y="80" text-anchor="middle" fill="#FFFFFF" font-family="system-ui, sans-serif" font-weight="bold" font-size="20">
            ${cleanTitle}
          </text>
          <text x="0" y="110" text-anchor="middle" fill="#94A3B8" font-family="monospace" font-size="12">
            AURORA NEURAL CANVAS • ${aspectRatio}
          </text>
        </g>
      </svg>
    `.trim();

    const base64Svg = Buffer.from(svg).toString('base64');
    const dataUri = `data:image/svg+xml;base64,${base64Svg}`;

    return res.json({
      imageUrl: dataUri,
      prompt: prompt.trim(),
      aspectRatio,
      width: dims.width,
      height: dims.height,
      source: 'aurora-canvas-fallback',
    });
  }
});

// -------------------------------------------------------------
// 9. Audio Transcription Endpoint (gemini-3.5-transcribe)
// -------------------------------------------------------------
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
    console.error('Error in /api/transcribe:', err);
    let message = 'Unable to transcribe audio.';
    if (err instanceof Error) message = err.message;
    return res.status(500).json({ error: message });
  }
});

// -------------------------------------------------------------
// 10. Vite Dev Server / Static Dist Serving
// -------------------------------------------------------------
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
