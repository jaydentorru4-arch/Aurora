import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Upload,
  Copy,
  Check,
  Download,
  Send,
  X,
  Cpu,
  Zap,
  AlertCircle,
  Volume2,
  FileAudio,
  Trash2,
} from 'lucide-react';
import { useAudioTranscriber } from '../hooks/useAudioTranscriber';
import { blobToBase64, transcribeAudio } from '../services/audioService';

interface AudioTranscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: (transcript: string) => void;
}

export const AudioTranscriberModal: React.FC<AudioTranscriberModalProps> = ({
  isOpen,
  onClose,
  onSendToChat,
}) => {
  const {
    isRecording,
    isTranscribing: isMicTranscribing,
    formattedDuration,
    duration,
    error: micError,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
    clearError,
  } = useAudioTranscriber();

  const [activeTab, setActiveTab] = useState<'mic' | 'file'>('mic');
  const [transcript, setTranscript] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isFileTranscribing, setIsFileTranscribing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isTranscribing = isMicTranscribing || isFileTranscribing;
  const currentError = activeTab === 'mic' ? micError : fileError;

  const handleStopMic = async () => {
    const result = await stopAndTranscribe();
    if (result) {
      setTranscript(result);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileError(null);
    }
  };

  const handleTranscribeFile = async () => {
    if (!uploadedFile) return;
    setIsFileTranscribing(true);
    setFileError(null);

    try {
      const base64 = await blobToBase64(uploadedFile);
      const mimeType = uploadedFile.type || 'audio/wav';
      const result = await transcribeAudio(base64, mimeType);
      setTranscript(result.transcript);
    } catch (err: unknown) {
      const msg = (err as Error)?.message || 'Failed to transcribe uploaded audio file.';
      setFileError(msg);
    } finally {
      setIsFileTranscribing(false);
    }
  };

  const handleCopy = async () => {
    if (!transcript) return;
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Failed to copy transcript:', e);
    }
  };

  const handleDownload = () => {
    if (!transcript) return;
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora-transcript-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = () => {
    if (!transcript || !onSendToChat) return;
    onSendToChat(transcript);
    onClose();
  };

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-[#090C1E] border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full blur-[90px] pointer-events-none opacity-40"
          style={{ background: 'linear-gradient(90deg, #0B00CF, #FF2D2B)' }}
        />

        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B00CF]/30 to-[#FF2D2B]/30 border border-white/15 flex items-center justify-center text-white shadow-md">
              <Mic className="w-5 h-5 text-[#FF2D2B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Audio Transcriber</h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#0B00CF]/30 text-[#93C5FD] border border-[#0B00CF]/60 font-semibold">
                  gemini-3.5-transcribe
                </span>
              </div>
              <p className="text-xs text-[#94A3B8]">
                Record speech or upload audio to transcribe with high fidelity
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isRecording) cancelRecording();
              onClose();
            }}
            aria-label="Close modal"
            className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Microphone vs Audio File */}
        <div className="px-6 pt-4 pb-2 border-b border-white/5 flex items-center gap-2 relative z-10">
          <button
            onClick={() => {
              if (!isRecording && !isTranscribing) setActiveTab('mic');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'mic'
                ? 'bg-white/10 text-white border border-white/20 shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Microphone Input</span>
          </button>

          <button
            onClick={() => {
              if (!isRecording && !isTranscribing) setActiveTab('file');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'bg-white/10 text-white border border-white/20 shadow-md'
                : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Audio File</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {/* TAB 1: Microphone */}
          {activeTab === 'mic' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              {/* Record Button Zone */}
              <div className="relative flex items-center justify-center">
                {/* Pulsing ring when recording */}
                {isRecording && (
                  <div className="absolute -inset-4 rounded-full bg-[#FF2D2B]/20 animate-ping opacity-60" />
                )}
                {isTranscribing && (
                  <div className="absolute -inset-4 rounded-full bg-[#0B00CF]/30 animate-pulse" />
                )}

                <button
                  type="button"
                  disabled={isTranscribing}
                  onClick={() => {
                    if (isRecording) {
                      handleStopMic();
                    } else {
                      startRecording();
                    }
                  }}
                  className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer ${
                    isRecording
                      ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white scale-105 ring-4 ring-rose-500/30'
                      : isTranscribing
                      ? 'bg-[#181D3D] text-[#93C5FD] border border-white/20 opacity-80 cursor-wait'
                      : 'bg-gradient-to-br from-[#0B00CF] to-[#FF2D2B] text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(255,45,43,0.4)]'
                  }`}
                >
                  {isRecording ? (
                    <Square className="w-7 h-7 fill-white" />
                  ) : isTranscribing ? (
                    <Cpu className="w-7 h-7 animate-pulse text-[#60A5FA]" />
                  ) : (
                    <Mic className="w-7 h-7" />
                  )}
                </button>
              </div>

              {/* Status & Timer */}
              <div className="text-center">
                {isRecording ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <span className="text-lg font-mono font-bold text-white tracking-wider">
                        {formattedDuration}
                      </span>
                    </div>
                    <p className="text-xs text-rose-400 font-medium">
                      Recording speech... Click again to stop & transcribe
                    </p>
                    {/* Simulated Waveform Visualizer */}
                    <div className="flex items-center justify-center gap-1 pt-2 h-6">
                      {[12, 22, 16, 28, 20, 10, 24, 18, 26, 14, 20].map((h, i) => (
                        <span
                          key={i}
                          className="w-1 bg-[#FF2D2B] rounded-full animate-pulse"
                          style={{
                            height: `${h}px`,
                            animationDelay: `${i * 0.08}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : isTranscribing ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                      <Cpu className="w-4 h-4 text-[#FF2D2B] animate-pulse" />
                      Transcribing speech to text...
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Processing audio clarity and speech recognition
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">
                      Click the microphone to start speaking
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      Speak clearly into your microphone in any language
                    </p>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              {isRecording && (
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={cancelRecording}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStopMic}
                    className="btn-aurora-gradient px-5 py-2 rounded-xl text-xs font-semibold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Done & Transcribe</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.flac,.aac"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-[#FF2D2B]/50 rounded-2xl p-6 text-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0F142D] border border-white/10 mx-auto flex items-center justify-center text-[#FF2D2B] mb-3 shadow-md">
                  <FileAudio className="w-6 h-6" />
                </div>
                {uploadedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{uploadedFile.name}</p>
                    <p className="text-xs text-[#94A3B8]">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • {uploadedFile.type || 'audio file'}
                    </p>
                    <span className="text-[11px] text-[#60A5FA] underline pt-1 inline-block">
                      Click to choose a different file
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Choose an audio file or drag it here</p>
                    <p className="text-xs text-[#94A3B8]">
                      Supports MP3, WAV, WebM, M4A, OGG, FLAC (up to 10MB)
                    </p>
                  </div>
                )}
              </div>

              {uploadedFile && (
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear file</span>
                  </button>

                  <button
                    onClick={handleTranscribeFile}
                    disabled={isFileTranscribing}
                    className="btn-aurora-gradient px-5 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-40"
                  >
                    {isFileTranscribing ? (
                      <>
                        <Cpu className="w-3.5 h-3.5 animate-pulse" />
                        <span>Transcribing audio...</span>
                      </>
                    ) : (
                      <>
                        <Cpu className="w-3.5 h-3.5" />
                        <span>Transcribe Audio</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {currentError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold">Transcription error: </span>
                {currentError}
              </div>
            </div>
          )}

          {/* Transcript Output Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] font-semibold flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-[#FF2D2B]" />
                Transcription Result:
              </label>
              {transcript && (
                <span className="text-[11px] font-mono text-[#64748B]">
                  {wordCount} words · {charCount} characters
                </span>
              )}
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your transcribed audio will appear here in real-time..."
              rows={4}
              className="w-full rounded-2xl bg-[#060814] border border-white/15 p-4 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#0B00CF] leading-relaxed resize-none transition-colors"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#070A18] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!transcript}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              disabled={!transcript}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .txt</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onSendToChat && (
              <button
                onClick={handleSend}
                disabled={!transcript}
                className="btn-aurora-gradient px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md disabled:opacity-30 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Aurora</span>
              </button>
            )}

            <button
              onClick={() => {
                if (isRecording) cancelRecording();
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
