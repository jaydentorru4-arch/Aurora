import { useState, useRef, useEffect, useCallback } from 'react';
import { blobToBase64, getSupportedAudioMimeType, transcribeAudio } from '../services/audioService';

export interface UseAudioTranscriberReturn {
  isRecording: boolean;
  isTranscribing: boolean;
  duration: number;
  formattedDuration: string;
  error: string | null;
  startRecording: () => Promise<boolean>;
  stopAndTranscribe: () => Promise<string | null>;
  cancelRecording: () => void;
  clearError: () => void;
}

export function useAudioTranscriber(): UseAudioTranscriberReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mimeTypeRef = useRef<string>('audio/webm');

  // Format MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupStream();
    };
  }, [cleanupStream]);

  const startRecording = async (): Promise<boolean> => {
    setError(null);
    audioChunksRef.current = [];

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Microphone input is not supported in this browser.');
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const mimeType = getSupportedAudioMimeType();
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(250); // slice chunks every 250ms
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      return true;
    } catch (err: unknown) {
      cleanupStream();
      setIsRecording(false);
      let errorMsg = 'Could not access microphone.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          errorMsg = 'No microphone device was found on your system.';
        } else {
          errorMsg = err.message;
        }
      }
      setError(errorMsg);
      return false;
    }
  };

  const stopAndTranscribe = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        cleanupStream();
        setIsRecording(false);
        resolve(null);
        return;
      }

      setIsRecording(false);
      setIsTranscribing(true);
      setError(null);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      recorder.onstop = async () => {
        try {
          cleanupStream();

          const mimeType = mimeTypeRef.current;
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

          if (audioBlob.size < 500) {
            setError('Recorded audio was too short or empty.');
            setIsTranscribing(false);
            resolve(null);
            return;
          }

          const base64 = await blobToBase64(audioBlob);
          const result = await transcribeAudio(base64, mimeType);

          setIsTranscribing(false);
          resolve(result.transcript);
        } catch (err: unknown) {
          setIsTranscribing(false);
          const msg = (err as Error)?.message || 'Failed to transcribe audio.';
          setError(msg);
          resolve(null);
        }
      };

      try {
        recorder.stop();
      } catch (err) {
        cleanupStream();
        setIsTranscribing(false);
        resolve(null);
      }
    });
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    cleanupStream();
    audioChunksRef.current = [];
    setIsRecording(false);
    setIsTranscribing(false);
    setDuration(0);
    setError(null);
  };

  const clearError = () => setError(null);

  return {
    isRecording,
    isTranscribing,
    duration,
    formattedDuration: formatTime(duration),
    error,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
    clearError,
  };
}
