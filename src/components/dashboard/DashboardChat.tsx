import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Send,
  Square,
  Sparkles,
  Info,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Lightbulb,
  PenTool,
  BookOpen,
  Code,
  ArrowUp,
  Mic,
  MicOff,
  Volume2,
} from 'lucide-react';
import { Conversation, Message, PersonalitySettings } from '../../types/dashboard';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ASSETS } from '../../assets';
import { useAudioTranscriber } from '../../hooks/useAudioTranscriber';
import { AudioTranscriberModal } from '../AudioTranscriberModal';

interface DashboardChatProps {
  conversation: Conversation | null;
  onSendMessage: (text: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  onStopGenerating: () => void;
  onToggleMobileSidebar: () => void;
  onToggleContextPanel: () => void;
  isContextPanelOpen: boolean;
  settings: PersonalitySettings;
}

export const DashboardChat: React.FC<DashboardChatProps> = ({
  conversation,
  onSendMessage,
  onRegenerate,
  isGenerating,
  onStopGenerating,
  onToggleMobileSidebar,
  onToggleContextPanel,
  isContextPanelOpen,
  settings,
}) => {
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(ASSETS.expressions.happy);
  const [isTranscriberOpen, setIsTranscriberOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    isRecording,
    isTranscribing,
    formattedDuration,
    error: micError,
    startRecording,
    stopAndTranscribe,
    cancelRecording,
    clearError: clearMicError,
  } = useAudioTranscriber();

  const handleMicToggle = async () => {
    if (isRecording) {
      const transcript = await stopAndTranscribe();
      if (transcript) {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    } else {
      await startRecording();
    }
  };

  const messages = conversation?.messages || [];
  const hasMessages = messages.length > 0;

  // Auto-scroll on new message or stream chunk
  useEffect(() => {
    if (messagesEndRef.current && !settings.reducedMotion) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, settings.reducedMotion]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleCopyMessage = async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedMessageId(msg.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (e) {
      console.warn('Failed to copy text:', e);
    }
  };

  const suggestionCards = [
    {
      id: 'idea',
      title: 'Explore an idea',
      desc: 'Help me develop an idea I\'ve been thinking about.',
      icon: Lightbulb,
      color: 'from-[#0B00CF]/20 to-[#300A6E]/20 text-[#38BDF8] border-[#0B00CF]/30',
      prompt: 'I have an idea I\'ve been thinking through lately. Help me break it down, analyze its strengths, and find fresh angles to make it awesome.',
    },
    {
      id: 'write',
      title: 'Write something',
      desc: 'Let\'s create a story, message, or piece of writing.',
      icon: PenTool,
      color: 'from-[#300A6E]/20 to-[#FF2D2B]/20 text-[#FF6B8B] border-[#FF2D2B]/30',
      prompt: 'Let\'s create an engaging, vivid piece of creative writing with distinct tone and atmospheric scene building.',
    },
    {
      id: 'learn',
      title: 'Learn something new',
      desc: 'Explain a topic in a way I\'ll understand.',
      icon: BookOpen,
      color: 'from-[#0B00CF]/20 to-[#FF2D2B]/20 text-[#A5B4FC] border-[#A5B4FC]/30',
      prompt: 'Explain how neural transformers and attention mechanisms work under the hood using an intuitive, memorable real-life analogy.',
    },
    {
      id: 'build',
      title: 'Build something',
      desc: 'Help me plan or code my next project.',
      icon: Code,
      color: 'from-[#C10823]/20 to-[#FF2D2B]/20 text-[#F43F5E] border-[#C10823]/30',
      prompt: 'Help me architect a modern full-stack web application with clean component boundaries, state management, and aesthetic UI.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#08080D] relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-10"
        style={{
          background: 'radial-gradient(circle, #0B00CF 0%, #300A6E 50%, #C10823 100%)',
        }}
        aria-hidden="true"
      />

      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-white/5 bg-[#08080E]/80 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Open sidebar"
            className="md:hidden p-2 rounded-xl bg-white/5 text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Active Conversation Title */}
          <div className="flex flex-col min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {conversation?.title || 'New Conversation'}
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-[#94A3B8]">
              <span className="flex items-center gap-1 text-[#38BDF8] font-mono">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini 3.8 Flash
              </span>
              <span>·</span>
              <span className="capitalize text-[#A5B4FC]">
                {settings.intensity} Senpai
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsTranscriberOpen(true)}
            aria-label="Transcribe audio"
            title="Transcribe Audio with gemini-3.5-transcribe"
            className="p-2 rounded-xl border border-white/10 hover:border-[#FF2D2B]/50 bg-white/[0.03] hover:bg-white/5 text-[#94A3B8] hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#FF2D2B]" />
            <span className="hidden sm:inline">Audio Transcribe</span>
          </button>

          <button
            onClick={onToggleContextPanel}
            aria-label="Toggle details panel"
            title="Conversation Details"
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isContextPanelOpen
                ? 'bg-[#0B00CF]/20 border-[#0B00CF] text-white shadow-[0_0_10px_rgba(11,0,207,0.3)]'
                : 'bg-white/[0.03] border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5'
            }`}
          >
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Details</span>
          </button>
        </div>
      </header>

      {/* Main Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 z-10">
        {!hasMessages ? (
          // Empty State Welcome Screen
          <div className="max-w-2xl mx-auto py-8 sm:py-14 flex flex-col items-center text-center animate-fade-in">
            {/* Aurora Character Presence Avatar */}
            <div className="relative mb-6">
              <div
                className="absolute -inset-3 rounded-full blur-xl opacity-40 animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #0B00CF, #FF2D2B)',
                }}
                aria-hidden="true"
              />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-white/20 bg-[#0F142D] shadow-2xl flex items-center justify-center">
                <img
                  src={avatarSrc}
                  onError={() => {
                    if (avatarSrc !== ASSETS.expressionFallbacks.happy) {
                      setAvatarSrc(ASSETS.expressionFallbacks.happy);
                    }
                  }}
                  alt="Aurora"
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                />
              </div>
            </div>

            {/* Welcome Heading & Copy */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3">
              What shall we explore today?
            </h1>
            <p className="text-sm sm:text-base text-[#94A3B8] max-w-lg mb-8 leading-relaxed">
              Your ideas, questions, and late-night thoughts. Let's see where they take us.
            </p>

            {/* 4 Clickable Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {suggestionCards.map((card) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={card.id}
                    onClick={() => onSendMessage(card.prompt)}
                    className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border hover:border-white/30 hover:scale-[1.01] transition-all duration-200 cursor-pointer text-left shadow-lg group relative overflow-hidden`}
                  >
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-white transition-colors">
                        {card.title}
                      </span>
                    </div>
                    <p className="text-xs text-[#94A3B8] leading-relaxed pl-1">
                      {card.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          // Message Thread
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLast = index === messages.length - 1;
              const hasError = !!msg.error;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 sm:gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Aurora Avatar */}
                  {!isUser && (
                    <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 bg-[#0F142D] border border-white/15 flex items-center justify-center shadow-md mt-0.5">
                      <img
                        src={avatarSrc}
                        onError={() => {
                          if (avatarSrc !== ASSETS.expressionFallbacks.happy) {
                            setAvatarSrc(ASSETS.expressionFallbacks.happy);
                          }
                        }}
                        alt="Aurora"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Message Bubble Shell */}
                  <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    {/* Sender Name & Time */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-semibold text-[#94A3B8]">
                        {isUser ? settings.userName : 'Aurora'}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`relative p-4 rounded-2xl shadow-lg ${
                        isUser
                          ? 'bg-[#121633] border border-[#0B00CF]/50 text-white rounded-tr-sm'
                          : hasError
                          ? 'bg-rose-950/30 border border-rose-500/40 text-rose-200 rounded-tl-sm'
                          : 'bg-[#0E1020] border border-white/10 text-[#E2E8F0] rounded-tl-sm'
                      }`}
                    >
                      {hasError ? (
                        <div className="flex flex-col gap-2.5 text-xs">
                          <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-semibold text-rose-300">Connection Notice</p>
                              <p className="text-rose-200/90 leading-relaxed">{msg.content}</p>
                            </div>
                          </div>
                          {isLast && !isGenerating && (
                            <div className="pt-2 border-t border-rose-500/20 flex justify-end">
                              <button
                                type="button"
                                onClick={onRegenerate}
                                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Retry Message</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : isUser ? (
                        <p className="text-sm whitespace-pre-wrap leading-relaxed select-text font-normal">
                          {msg.content}
                        </p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}

                      {/* Action Bar beneath Bubble */}
                      {!isUser && !hasError && (
                        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-white/5 text-[#94A3B8]">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg)}
                            title="Copy message"
                            className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                          >
                            {copiedMessageId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {isLast && !isGenerating && (
                            <button
                              type="button"
                              onClick={onRegenerate}
                              title="Regenerate response"
                              className="p-1 rounded hover:bg-white/10 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Regenerate</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Active Streaming / Typing Indicator */}
            {isGenerating && (
              <div className="flex gap-3 sm:gap-4 justify-start items-center animate-fade-in">
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 bg-[#0F142D] border border-white/15 flex items-center justify-center shadow-md">
                  <img
                    src={avatarSrc}
                    alt="Aurora"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-[#0E1020] border border-white/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF2D2B] animate-ping" />
                  <span className="text-xs text-[#94A3B8] font-mono">
                    Aurora is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Sticky Bottom Message Composer */}
      <div className="p-4 sm:p-5 border-t border-white/5 bg-[#06070E]/95 backdrop-blur-md z-20 shrink-0">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Error notice if mic failed */}
          {micError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between animate-fade-in">
              <span className="truncate">{micError}</span>
              <button
                type="button"
                onClick={clearMicError}
                className="text-white/60 hover:text-white text-xs font-semibold px-2 py-0.5 rounded cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Active Voice Recording UI */}
          {isRecording ? (
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[#0F142D] border border-rose-500/40 shadow-2xl flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Recording speech
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-md">
                      {formattedDuration}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 h-3 mt-1">
                    {[10, 18, 12, 22, 14, 8, 20, 16, 24, 12, 18].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-[#FF2D2B] rounded-full animate-pulse"
                        style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className="btn-aurora-gradient px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Done & Transcribe</span>
                </button>
              </div>
            </div>
          ) : isTranscribing ? (
            <div className="p-3.5 rounded-2xl bg-[#0D122D] border border-[#0B00CF]/50 shadow-2xl flex items-center gap-3 animate-fade-in">
              <Sparkles className="w-5 h-5 text-[#60A5FA] animate-spin shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Transcribing audio with gemini-3.5-transcribe...</span>
                <span className="text-[#94A3B8] block text-[11px]">Processing speech into text</span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="relative flex items-end gap-2 p-2 sm:p-2.5 rounded-2xl bg-[#0D1024] border border-white/15 shadow-2xl focus-within:border-[#0B00CF]/80 focus-within:ring-1 focus-within:ring-[#0B00CF]/50 transition-all"
            >
              {/* Input Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message Aurora as ${settings.userName}... (Shift+Enter for newline)`}
                rows={1}
                disabled={isGenerating}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-[#64748B] focus:outline-none resize-none leading-relaxed max-h-44 disabled:opacity-50"
              />

              {/* Microphone Voice Input Button */}
              <button
                type="button"
                onClick={handleMicToggle}
                disabled={isGenerating}
                title="Speak to Transcribe with gemini-3.5-transcribe"
                aria-label="Transcribe speech with microphone"
                className="p-2.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all cursor-pointer shrink-0 disabled:opacity-30"
              >
                <Mic className="w-4 h-4 text-[#FF2D2B]" />
              </button>

              {/* Send / Stop Buttons */}
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStopGenerating}
                  title="Stop response"
                  className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center"
                >
                  <Square className="w-4 h-4 fill-white" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  title="Send message"
                  className="p-2.5 rounded-xl btn-aurora-gradient disabled:opacity-30 disabled:hover:opacity-30 text-white transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              )}
            </form>
          )}

          {/* Bottom Keyboard Hint */}
          <div className="flex items-center justify-between text-[11px] text-[#64748B] px-2 pt-1 font-sans">
            <span className="hidden sm:inline">
              Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#94A3B8]">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-[#94A3B8]">Shift + Enter</kbd> for newline
            </span>
            <span className="text-[#94A3B8] font-mono ml-auto flex items-center gap-1.5">
              <Mic className="w-3 h-3 text-[#FF2D2B]" />
              <span>Voice powered by gemini-3.5-transcribe</span>
            </span>
          </div>
        </div>
      </div>

      {/* Audio Transcriber Modal */}
      <AudioTranscriberModal
        isOpen={isTranscriberOpen}
        onClose={() => setIsTranscriberOpen(false)}
        onSendToChat={(transcriptText) => {
          setInput((prev) => (prev ? `${prev} ${transcriptText}` : transcriptText));
          setTimeout(() => textareaRef.current?.focus(), 150);
        }}
      />
    </div>
  );
};
