import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Wand2,
  BookOpen,
  FileText,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Globe,
  ExternalLink,
  Cpu,
  ArrowUp,
  X,
  Plus,
  PanelLeft,
} from 'lucide-react';
import { Conversation, Message, PersonalitySettings } from '../../types/dashboard';
import { MarkdownRenderer } from './MarkdownRenderer';
import { ASSETS } from '../../assets';
import { generateAiImage, synthesizeSpeech } from '../../services/aiService';

interface DashboardChatProps {
  conversation: Conversation | null;
  onSendMessage: (text: string, options?: { enableResearch?: boolean }) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  onStopGenerating: () => void;
  onClearConversation: () => void;
  onNewChat: () => void;
  settings: PersonalitySettings;
  researchMode: boolean;
  onToggleResearchMode: () => void;
  onToggleSidebar?: () => void;
}

export const DashboardChat: React.FC<DashboardChatProps> = ({
  conversation,
  onSendMessage,
  onRegenerate,
  isGenerating,
  onStopGenerating,
  onClearConversation,
  onNewChat,
  settings,
  researchMode,
  onToggleResearchMode,
  onToggleSidebar,
}) => {
  const [input, setInput] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [avatarSrc, setAvatarSrc] = useState(ASSETS.expressions.happy);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageRatio, setImageRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Audio / Speech
  const [isPlayingAudioId, setIsPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = conversation?.messages || [];
  const hasMessages = messages.length > 0;

  // Auto-scroll on new message or chunk
  useEffect(() => {
    if (messagesEndRef.current && !settings.reducedMotion) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, settings.reducedMotion]);

  // Adjust textarea height dynamically
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

  const handleSubmit = (overrideText?: string, enableResearchOverride?: boolean) => {
    const textToSend = (overrideText ?? input).trim();
    if (!textToSend || isGenerating) return;

    // Check if the user is asking to generate an image
    const imageMatch = textToSend.match(
      /^(?:🎨\s*)?(?:generate(?:\s+an?)?\s+image(?:\s+of)?|create(?:\s+an?)?\s+image(?:\s+of)?|\/image|draw(?:\s+a|\s+an|\s+picture\s+of)?|paint(?:\s+a|\s+an|\s+picture\s+of)?)\s*:?\s*(.+)$/i
    );
    if (imageMatch && imageMatch[1]) {
      setInput('');
      handleGenerateImage(imageMatch[1].trim());
      return;
    }

    onSendMessage(textToSend, {
      enableResearch: enableResearchOverride ?? researchMode,
    });
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

  const handleSpeakMessage = async (msg: Message) => {
    if (isPlayingAudioId === msg.id) {
      audioRef.current?.pause();
      setIsPlayingAudioId(null);
      return;
    }
    try {
      setIsPlayingAudioId(msg.id);
      const audioUrl = await synthesizeSpeech(msg.content, 'Kore');
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.onended = () => setIsPlayingAudioId(null);
        audioRef.current.onerror = () => setIsPlayingAudioId(null);
        await audioRef.current.play();
      }
    } catch (err) {
      console.warn('TTS playback error:', err);
      setIsPlayingAudioId(null);
    }
  };

  const handleGenerateImage = async (customPrompt?: string) => {
    const targetPrompt = (customPrompt || imagePrompt).trim();
    if (!targetPrompt || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setImageError(null);
    setShowImageStudio(false);

    try {
      const generated = await generateAiImage({
        prompt: targetPrompt,
        aspectRatio: imageRatio,
      });

      // Insert image message into conversation via custom send
      onSendMessage(`🎨 Created artwork: "${targetPrompt}"`);
      // Update image Prompt state
      setImagePrompt('');
    } catch (err: unknown) {
      console.error('Image gen failed:', err);
      setImageError(err instanceof Error ? err.message : 'Image generation failed');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4 Standard Quick Action Cards per Section 3.E
  const quickActionCards = [
    {
      id: 'explore',
      title: 'Explore',
      desc: 'Discover new ideas.',
      icon: Compass,
      glowStyle: 'shadow-[0_0_15px_rgba(11,0,207,0.25)] border-[#0B00CF]/30 hover:border-[#60A5FA]/60 bg-gradient-to-br from-[#0B00CF]/15 to-[#300A6E]/10',
      iconBox: 'bg-[#0B00CF]/20 text-[#60A5FA] border border-[#0B00CF]/40',
      prompt: 'Explore the latest breakthroughs in artificial intelligence, engineering, and future technology.',
    },
    {
      id: 'create',
      title: 'Create',
      desc: 'Write, build, and imagine.',
      icon: Wand2,
      glowStyle: 'shadow-[0_0_15px_rgba(255,45,43,0.2)] border-[#FF2D2B]/30 hover:border-[#FF2D2B]/60 bg-gradient-to-br from-[#C10823]/15 to-[#FF2D2B]/10',
      iconBox: 'bg-[#FF2D2B]/20 text-[#FF6B8B] border border-[#FF2D2B]/40',
      prompt: 'Help me brainstorm, outline, and write an ambitious creative project with vivid atmosphere and concept art ideas.',
    },
    {
      id: 'learn',
      title: 'Learn',
      desc: 'Understand something new.',
      icon: BookOpen,
      glowStyle: 'shadow-[0_0_15px_rgba(139,92,246,0.2)] border-purple-500/30 hover:border-purple-400/60 bg-gradient-to-br from-[#300A6E]/20 to-[#0B00CF]/10',
      iconBox: 'bg-purple-500/20 text-[#C084FC] border border-purple-500/40',
      prompt: 'Explain how neural transformers and deep reasoning models operate under the hood using an intuitive, memorable real-life analogy.',
    },
    {
      id: 'summarise',
      title: 'Summarise',
      desc: 'Make information clearer.',
      icon: FileText,
      glowStyle: 'shadow-[0_0_15px_rgba(2,132,199,0.2)] border-sky-500/30 hover:border-sky-400/60 bg-gradient-to-br from-[#0284C7]/15 to-[#0B00CF]/10',
      iconBox: 'bg-sky-500/20 text-[#38BDF8] border border-sky-500/40',
      prompt: 'Help me summarize and distill complex research into key takeaways, structured conclusions, and actionable insights.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-between w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 overflow-hidden relative">
      <audio ref={audioRef} className="hidden" />

      {/* Confirmation Modal for Clear Conversation */}
      {isConfirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm bg-[#080B1F] border border-white/15 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 text-[#FF2D2B] flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Clear this conversation?</h3>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                All messages in this session will be permanently erased. This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(false)}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-[#CBD5E1] bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmClearOpen(false);
                  onClearConversation();
                }}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-[#FF2D2B] hover:bg-[#D91B1A] transition-colors cursor-pointer shadow-md"
              >
                Clear Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {/* B. Welcome Section (Compact above the main glass panel) */}
      <div className="text-center mb-2.5 sm:mb-3 select-none shrink-0">
        <h1 className="text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#E2E8F0] to-[#93C5FD] bg-clip-text text-transparent">
          Your space. Your ideas. Let&apos;s create something.
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 font-medium">
          Ask Aurora anything. Let&apos;s figure it out together.
        </p>
      </div>

      {/* C. Main Glassmorphic Chat Panel */}
      <div className="w-full flex-1 flex flex-col bg-[#070A1E]/75 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden relative min-h-0">
        {/* Panel Header */}
        <div className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-white/10 bg-[#0B0F28]/70 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                title="Toggle chats list"
                className="p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Aurora Character Avatar */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden border border-white/20 bg-[#0E122B] shadow-sm shrink-0">
              <img
                src={avatarSrc}
                onError={() => setAvatarSrc(ASSETS.expressionFallbacks.happy)}
                alt="Aurora"
                className="w-full h-full object-cover object-top select-none"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#0B0F28]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-wide">Aurora</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-md bg-[#FF2D2B]/20 text-[#FF2D2B] border border-[#FF2D2B]/30 font-semibold">
                  AI
                </span>
                <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  Gemini Ready • Grounded Research
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8]">
                {isGenerating ? (
                  <span className="text-[#60A5FA] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] animate-ping" />
                    Synthesizing response...
                  </span>
                ) : (
                  'Online • Ready for deep research & creativity'
                )}
              </p>
            </div>
          </div>

          {/* Panel Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Research Mode Toggle */}
            <button
              type="button"
              onClick={onToggleResearchMode}
              title={researchMode ? 'Deep Research Active (Google Grounding)' : 'Research Grounding Off'}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                researchMode
                  ? 'bg-blue-500/20 border-blue-500/50 text-[#60A5FA] shadow-[0_0_12px_rgba(59,130,246,0.3)]'
                  : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Research</span>
            </button>

            {/* Clear Conversation Action */}
            {hasMessages && (
              <button
                type="button"
                onClick={() => setIsConfirmClearOpen(true)}
                title="Clear current conversation"
                className="p-1.5 sm:p-2 rounded-xl text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* New Chat Button */}
            <button
              type="button"
              onClick={onNewChat}
              title="Start New Chat"
              className="p-1.5 sm:p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Image Generator Drawer (Glassmorphic) */}
        {showImageStudio && (
          <div className="p-3 bg-[#080B1E]/95 border-b border-white/10 animate-fade-in text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#FF2D2B]" />
                AI Artwork & Visual Generator
              </span>
              <div className="flex items-center gap-1">
                {(['1:1', '16:9', '9:16'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setImageRatio(r)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                      imageRatio === r
                        ? 'bg-[#FF2D2B] text-white border-[#FF2D2B]'
                        : 'bg-white/5 text-[#94A3B8] border-white/10 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="e.g. Futuristic glass architecture in rain, cinematic lighting, ultra-detailed..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerateImage();
                  }
                }}
                className="flex-1 bg-[#050713] border border-white/15 rounded-xl px-3 py-2 text-white placeholder-[#64748B] focus:outline-none focus:border-[#FF2D2B]"
              />
              <button
                type="button"
                onClick={() => handleGenerateImage()}
                disabled={!imagePrompt.trim() || isGeneratingImage}
                className="btn-aurora-gradient px-4 py-2 rounded-xl font-semibold text-white cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shrink-0"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isGeneratingImage ? 'Painting...' : 'Create'}</span>
              </button>
            </div>

            {imageError && (
              <div className="text-[11px] text-rose-400">{imageError}</div>
            )}
          </div>
        )}

        {/* Conversation Scroll Feed */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-4 sm:py-5 space-y-4 sm:space-y-5 scroll-smooth min-h-0">
          {!hasMessages ? (
            /* Empty State: Warm Glass Greeting & Persona Welcome */
            <div className="h-full flex flex-col items-center justify-center text-center py-6 animate-fade-in space-y-3">
              <div className="relative">
                <div
                  className="absolute -inset-3 rounded-full blur-xl opacity-35 animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #0B00CF, #FF2D2B)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/20 bg-[#0E122B] shadow-2xl flex items-center justify-center">
                  <img
                    src={avatarSrc}
                    onError={() => setAvatarSrc(ASSETS.expressionFallbacks.happy)}
                    alt="Aurora"
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  />
                </div>
              </div>

              <div className="max-w-md">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Welcome to your creative workspace
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  I can research questions from authoritative sources, assist with engineering architecture, generate artwork, or brainstorm bold new concepts.
                </p>
              </div>
            </div>
          ) : (
            /* Active Message Stream */
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              const isLatestModel = !isUser && index === messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isUser ? 'items-end' : 'items-start'
                  } group animate-fade-in`}
                >
                  {/* Sender label and timestamp */}
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-[#94A3B8]">
                      {isUser ? settings.userName || 'You' : 'Aurora'}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`relative max-w-[92%] sm:max-w-[85%] md:max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-[#0B00CF] to-[#1E1B4B] text-white border border-blue-400/30 shadow-[0_4px_20px_rgba(11,0,207,0.3)] rounded-br-xs'
                        : msg.error
                        ? 'bg-red-950/60 border border-red-500/40 text-red-200 rounded-bl-xs'
                        : 'bg-[#0A0E27]/80 backdrop-blur-xl border border-white/10 text-[#F1F5F9] shadow-[0_4px_25px_rgba(0,0,0,0.5)] rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    ) : (
                      <div className="space-y-3">
                        {/* Thinking / Streaming Indicator */}
                        {isLatestModel && isGenerating && !msg.content ? (
                          <div className="flex items-center gap-2 py-1 text-xs text-[#60A5FA]">
                            <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-ping" />
                            <span className="font-mono text-[11px]">
                              Aurora is conducting research & reasoning...
                            </span>
                          </div>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}

                        {/* Research Grounding Sources with Verified Badges */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#60A5FA]">
                              <Globe className="w-3.5 h-3.5" />
                              <span>Verified Sources & Research:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.map((src, idx) => (
                                <a
                                  key={idx}
                                  href={src.uri}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={src.uri}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/30 hover:border-blue-400 text-[11px] text-blue-200 transition-colors shadow-xs group/link"
                                >
                                  <span className="max-w-[180px] sm:max-w-[240px] truncate">
                                    {src.title || new URL(src.uri).hostname}
                                  </span>
                                  <ExternalLink className="w-3 h-3 text-blue-400 group-hover/link:translate-x-0.5 transition-transform" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions under AI messages */}
                  {!isUser && msg.content && (
                    <div className="flex items-center gap-1 mt-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg)}
                        title="Copy text"
                        className="p-1 rounded-md text-[#64748B] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {copiedMessageId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg)}
                        title={isPlayingAudioId === msg.id ? 'Pause voice' : 'Listen with Aurora voice'}
                        className="p-1 rounded-md text-[#64748B] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {isPlayingAudioId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {isLatestModel && !isGenerating && (
                        <button
                          type="button"
                          onClick={onRegenerate}
                          title="Regenerate response"
                          className="p-1 rounded-md text-[#64748B] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* D. Message Composer (Centerpiece Glass Input) */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#080B22]/85 backdrop-blur-xl shrink-0 space-y-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative flex items-end gap-2 p-2 sm:p-2.5 rounded-2xl bg-[#060919]/90 border border-white/15 shadow-2xl focus-within:border-[#0B00CF] focus-within:ring-2 focus-within:ring-[#0B00CF]/30 transition-all"
          >
            {/* Tool Shortcuts inside composer */}
            <div className="flex items-center gap-1 pb-1 pl-1">
              {/* Image Generation studio trigger */}
              <button
                type="button"
                onClick={() => setShowImageStudio(!showImageStudio)}
                title="AI Image Generator Studio"
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  showImageStudio
                    ? 'bg-[#FF2D2B]/20 border-[#FF2D2B]/40 text-[#FF2D2B]'
                    : 'text-[#64748B] hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Research Grounding Indicator */}
              <button
                type="button"
                onClick={onToggleResearchMode}
                title={researchMode ? 'Deep Research Enabled (Google Grounding)' : 'Research Grounding Off'}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  researchMode
                    ? 'bg-blue-500/20 border-blue-500/40 text-[#60A5FA]'
                    : 'text-[#64748B] hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>

            {/* Input Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Aurora anything..."
              rows={1}
              disabled={isGenerating}
              className="flex-1 bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none resize-none leading-relaxed max-h-40 disabled:opacity-50"
            />

            {/* Send / Stop Button */}
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGenerating}
                title="Stop generation"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                title="Send message"
                className="btn-aurora-gradient w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                <ArrowUp className="w-4 h-4 font-bold" />
              </button>
            )}
          </form>

          {/* E. Quick Action Cards (4 Compact Glassmorphic Cards Below Composer) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5">
            {quickActionCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSubmit(card.prompt, true)}
                  className={`p-2.5 rounded-xl border backdrop-blur-md text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer group flex items-start gap-2.5 ${card.glowStyle}`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${card.iconBox}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-white group-hover:text-white block truncate">
                      {card.title}
                    </span>
                    <span className="text-[10px] text-[#CBD5E1] block truncate leading-tight mt-0.5">
                      {card.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
