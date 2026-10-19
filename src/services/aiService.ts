import { Message, PersonalitySettings } from '../types/dashboard';

export interface SendMessageOptions {
  messages: Message[];
  settings: PersonalitySettings;
  onChunk: (chunkText: string) => void;
  signal?: AbortSignal;
}

export async function streamChatResponse({
  messages,
  settings,
  onChunk,
  signal,
}: SendMessageOptions): Promise<string> {
  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    personality: {
      responseStyle: settings.responseStyle,
      intensity: settings.intensity,
      userName: settings.userName,
    },
    stream: true,
  };

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let errorMsg = `Server responded with status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  // Parse SSE Stream
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullAccumulatedText = '';
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data:')) continue;

      const dataStr = trimmed.slice(5).trim();
      if (dataStr === '[DONE]') {
        return fullAccumulatedText;
      }

      try {
        const parsed = JSON.parse(dataStr);
        if (parsed.error) {
          throw new Error(parsed.error);
        }
        if (typeof parsed.text === 'string') {
          fullAccumulatedText += parsed.text;
          onChunk(parsed.text);
        }
      } catch (err) {
        if (err instanceof SyntaxError) {
          // Incomplete chunk, will accumulate
        } else {
          throw err;
        }
      }
    }
  }

  return fullAccumulatedText;
}
