import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Square,
  RotateCcw,
  Maximize2,
  Sparkles,
  ChevronDown,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ASSETS } from '../assets';
import { Message, PersonalitySettings, DEFAULT_SETTINGS } from '../types/dashboard';
import { streamChatResponse } from '../services/aiService';
import { MarkdownRenderer } from './dashboard/MarkdownRenderer';

interface ChatbotWidgetProps {
  onOpenDashboard?: () => void;
  externalOpen?: boolean;
  onCloseExternal?: () => void;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
}

const STORAGE_KEY = 'aurora_quick_chatbot_messages';

const INITIAL_AURORA_MESSAGE: Message = {
  id: 'aurora_welcome_0',
  role: 'model',
  content: "Look who found me. I'm **Aurora** — your AI Senpai.\n\nWhether you need code review, late-night anime recommendations, or someone to roast your life choices gently... I'm listening. What's on your mind?",
  timestamp: Date.now(),
};

const STARTER_PROMPTS = [
  'Who are you really, Aurora?',
  'Recommend a hidden gem cyberpunk anime',
  'Help me fix a tricky code bug',
  'Give me some real-talk senpai advice',
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  onOpenDashboard,
  externalOpen,
  onCloseExternal,
  initialPrompt,
  onPromptConsumed,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to initial
    }
    return [INITIAL_AURORA_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expression, setExpression] = useState<keyof typeof ASSETS.expressions>('happy');
  const [avatarSrc, setAvatarSrc] = useState(ASSETS.expressions.happy);
  const [bubbleTooltipVisible, setBubbleTooltipVisible] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync external open trigger
  useEffect(() => {
    if (externalOpen !== undefined) {
      setIsOpen(externalOpen);
      if (externalOpen) {
        setBubbleTooltipVisible(false);
        setHasUnread(false);
      }
    }
  }, [externalOpen]);

  // Save messages to storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Update avatar when expression changes
  useEffect(() => {
    setAvatarSrc(ASSETS.expressions[expression] || ASSETS.expressions.happy);
  }, [expression]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isGenerating]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Auto-hide teaser tooltip after 8s if untouched
  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbleTooltipVisible(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      setBubbleTooltipVisible(false);
      setHasUnread(false);
    } else {
      onCloseExternal?.();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend ?? input).trim();
    if (!prompt || isGenerating) return;

    setInput('');
    setBubbleTooltipVisible(false);

    const userMsg: Message = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const auroraPlaceholder: Message = {
      id: `aur_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: 'model',
      content: '',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, auroraPlaceholder]);
    setIsGenerating(true);
    setExpression('thoughtful' as any in ASSETS.expressions ? 'thoughtful' as any : 'happy');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      await streamChatResponse({
        messages: updatedMessages,
        settings: DEFAULT_SETTINGS,
        signal: controller.signal,
        onChunk: (chunk) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.id === auroraPlaceholder.id) {
              return [
                ...prev.slice(0, -1),
                { ...last, content: last.content + chunk },
              ];
            }
            return prev;
          });
        },
      });

      setExpression('smug' as any in ASSETS.expressions ? 'smug' as any : 'happy');
      setTimeout(() => setExpression('happy'), 4000);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        // user aborted
        setExpression('happy');
      } else {
        const errorMsg = (err as Error)?.message || 'Aurora could not respond right now.';
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.id === auroraPlaceholder.id) {
            return [
              ...prev.slice(0, -1),
              {
                ...last,
                content: `*Sigh*... Connection glitch: ${errorMsg}\n\nDon't worry, try asking again.`,
                error: true,
              },
            ];
          }
          return prev;
        });
        setExpression('pouty');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    abortControllerRef.current?.abort();
    setIsGenerating(false);
    setExpression('happy');
  };

  const handleResetChat = () => {
    if (isGenerating) handleStopGenerating();
    setMessages([INITIAL_AURORA_MESSAGE]);
    setExpression('happy');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Consume incoming initial prompt from topic clicks
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setIsOpen(true);
      setBubbleTooltipVisible(false);
      handleSendMessage(initialPrompt.trim());
      onPromptConsumed?.();
    }
  }, [initialPrompt]);

  return (
    <aside aria-label="Aurora AI Assistant Chatbot" className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* 1. Closed State: Floating Launcher & Ambient Teaser */}
      {!isOpen && (
        <div className="relative flex flex-col items-end">
          {/* Teaser Bubble */}
          {bubbleTooltipVisible && (
            <div
              onClick={handleToggle}
              className="mb-3 max-w-[240px] bg-[#0E1128]/95 border border-[#300A6E]/80 backdrop-blur-md rounded-2xl rounded-br-xs px-3.5 py-2.5 shadow-[0_10px_25px_rgba(0,0,0,0.6)] cursor-pointer hover:border-[#FF2D2B]/60 transition-all duration-300 animate-fade-in group select-none"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#FF2D2B] flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B] animate-pulse" />
                  Aurora AI
                </span>
                <button
                  type="button"
                  aria-label="Dismiss chat hint"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBubbleTooltipVisible(false);
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <p className="text-xs text-[#E2E8F0] leading-snug">
                Psst... Need some real-talk advice or coding backup? Say hi! ♡
              </p>
            </div>
          )}

          {/* Launcher Button */}
          <button
            type="button"
            onClick={handleToggle}
            aria-label="Open Aurora AI Chatbot"
            className="group relative flex items-center justify-center cursor-pointer p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-[#FF2D2B] transition-transform duration-200 active:scale-95"
          >
            {/* Ambient Multi-Layer Glow */}
            <div
              className="absolute -inset-1 rounded-full opacity-70 group-hover:opacity-100 blur-md transition-opacity duration-300 animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #0B00CF, #FF2D2B, #300A6E)',
              }}
            />

            {/* Core Circular Button */}
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#080B1C] border border-white/20 p-1 flex items-center justify-center overflow-hidden shadow-2xl">
              {/* Character Avatar with subtle zoom on hover */}
              <img
                src={avatarSrc}
                onError={() => {
                  setAvatarSrc(ASSETS.expressionFallbacks.happy);
                }}
                alt="Aurora Chat"
                className="w-full h-full object-cover object-top rounded-full group-hover:scale-110 transition-transform duration-300 select-none"
              />

              {/* Online Indicator Badge */}
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-2 border-[#080B1C] shadow-sm flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
              </div>

              {/* Unread dot */}
              {hasUnread && (
                <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#FF2D2B] border-2 border-[#080B1C]" />
              )}
            </div>

            {/* Hover tooltip for desktop */}
            <span className="sr-only">Open Aurora AI Chatbot</span>
          </button>
        </div>
      )}

      {/* 2. Expanded State: Cinematic Floating Chat Window */}
      {isOpen && (
        <section
          aria-label="Aurora Chat Workspace"
          className="relative w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[85vh] bg-[#070916]/95 border border-white/15 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-fade-in"
          style={{
            boxShadow: '0 0 35px rgba(11, 0, 207, 0.25), 0 25px 70px rgba(0,0,0,0.9)',
          }}
        >
          {/* Ambient Header Glow */}
          <div
            className="absolute top-0 left-0 right-0 h-24 pointer-events-none opacity-30 blur-2xl"
            style={{
              background: 'linear-gradient(90deg, #0B00CF, #C10823)',
            }}
          />

          {/* Header */}
          <header className="relative z-10 px-4 py-3 sm:px-5 sm:py-3.5 bg-[#0B0E24]/80 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mini Avatar */}
              <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/20 bg-[#121630] shrink-0 shadow-md">
                <img
                  src={avatarSrc}
                  onError={() => {
                    setAvatarSrc(ASSETS.expressionFallbacks.happy);
                  }}
                  alt="Aurora"
                  className="w-full h-full object-cover object-top select-none"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border border-[#0B0E24]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide">Aurora</h3>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-[#FF2D2B]/20 text-[#FF2D2B] border border-[#FF2D2B]/30 font-semibold">
                    Senpai AI
                  </span>
                </div>
                <p className="text-[11px] text-[#94A3B8]">
                  {isGenerating ? 'Typing something witty...' : 'Ready to talk • Powered by Gemini'}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {/* Full Dashboard link */}
              {onOpenDashboard && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onOpenDashboard();
                  }}
                  title="Expand to Full Cinematic Dashboard"
                  aria-label="Expand to full dashboard"
                  className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              )}

              {/* Reset Chat */}
              <button
                type="button"
                onClick={handleResetChat}
                title="Reset conversation"
                aria-label="Reset conversation"
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Close/Minimize */}
              <button
                type="button"
                onClick={handleToggle}
                title="Minimize chatbot"
                aria-label="Minimize chatbot"
                className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Quick Dashboard Promo Banner */}
          {onOpenDashboard && (
            <div className="px-4 py-1.5 bg-[#0D122D]/90 border-b border-white/5 flex items-center justify-between text-[11px]">
              <span className="text-[#94A3B8] flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#FF2D2B]" />
                Want the full studio workspace?
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenDashboard();
                }}
                className="text-[#60A5FA] hover:text-white font-semibold transition-colors underline cursor-pointer"
              >
                Open Dashboard →
              </button>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div
                    className={`relative text-xs sm:text-[13px] leading-relaxed max-w-[88%] sm:max-w-[84%] rounded-2xl px-3.5 py-2.5 shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-[#0B00CF] to-[#300A6E] text-white rounded-tr-xs border border-white/15'
                        : 'bg-[#0E122B] text-[#E2E8F0] rounded-tl-xs border border-white/10'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    ) : (
                      <div>
                        {msg.content ? (
                          <MarkdownRenderer content={msg.content} />
                        ) : (
                          <div className="flex items-center gap-1.5 py-1 text-[#94A3B8] text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B] animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B] animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B] animate-bounce [animation-delay:0.4s]" />
                            <span className="ml-1 text-[11px] font-mono text-[#CBD5E1]">thinking...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#64748B] mt-1 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}

            {/* Quick Suggestions Chips if conversation is short */}
            {messages.length <= 2 && !isGenerating && (
              <div className="pt-2 pb-1">
                <p className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#FF2D2B]" />
                  Suggested conversation sparks:
                </p>
                <div className="flex flex-col gap-1.5">
                  {STARTER_PROMPTS.map((promptText, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSendMessage(promptText)}
                      className="text-left text-xs text-[#CBD5E1] bg-white/[0.03] hover:bg-white/[0.08] hover:text-white border border-white/10 hover:border-[#FF2D2B]/50 rounded-xl px-3 py-2 transition-all duration-150 cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate">{promptText}</span>
                      <span className="text-[#FF2D2B] opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-1 font-bold">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Composer */}
          <footer className="p-3 bg-[#0B0E24]/90 border-t border-white/10">
            <div className="relative flex items-center rounded-xl bg-[#060814] border border-white/15 focus-within:border-[#0B00CF] transition-colors">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Aurora anything..."
                rows={1}
                disabled={isGenerating}
                className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none resize-none max-h-24 disabled:opacity-50"
              />

              <div className="flex items-center gap-1 pr-2">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={handleStopGenerating}
                    title="Stop generation"
                    aria-label="Stop generation"
                    className="p-1.5 rounded-lg bg-[#FF2D2B]/20 text-[#FF2D2B] hover:bg-[#FF2D2B]/30 transition-colors cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!input.trim()}
                    title="Send message (Enter)"
                    aria-label="Send message"
                    className="p-1.5 rounded-lg text-white bg-gradient-to-r from-[#0B00CF] to-[#FF2D2B] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-[#64748B]">
              <span>Enter to send • Shift+Enter for newline</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-[#94A3B8]">
                Aurora v2.5
              </span>
            </div>
          </footer>
        </section>
      )}
    </aside>
  );
};
