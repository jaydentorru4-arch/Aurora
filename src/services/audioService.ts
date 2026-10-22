export interface TranscribeResult {
  transcript: string;
  model: string;
  mimeType?: string;
}

export async function transcribeAudio(
  base64Audio: string,
  mimeType = 'audio/webm',
  prompt?: string
): Promise<TranscribeResult> {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioData: base64Audio,
      mimeType,
      prompt,
    }),
  });

  if (!response.ok) {
    let errorMsg = `Transcription failed with status ${response.status}`;
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

  const data = await response.json();
  return {
    transcript: data.transcript || '',
    model: data.model || 'gemini-3.5-transcribe',
    mimeType: data.mimeType,
  };
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result) {
        reject(new Error('Failed to convert audio blob to base64'));
        return;
      }
      // Result is typically "data:audio/webm;base64,GkXfo59ChoEBQveBAULygQ8..."
      // Extract only the base64 portion
      const base64Index = result.indexOf(';base64,');
      if (base64Index !== -1) {
        resolve(result.substring(base64Index + 8));
      } else {
        const commaIndex = result.indexOf(',');
        resolve(commaIndex !== -1 ? result.substring(commaIndex + 1) : result);
      }
    };
    reader.onerror = () => reject(new Error('FileReader error during audio conversion'));
    reader.readAsDataURL(blob);
  });
}

export function getSupportedAudioMimeType(): string {
  if (typeof window === 'undefined' || !window.MediaRecorder) {
    return 'audio/webm';
  }

  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm';
}
