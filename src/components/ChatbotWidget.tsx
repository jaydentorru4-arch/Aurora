import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Square,
  RotateCcw,
  Plus,
  Trash2,
  Zap,
  ChevronDown,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Compass,
  MapPin,
  Search,
  Maximize2,
  Minimize2,
  Image as ImageIcon,
  Download,
  Wand2,
  ExternalLink,
} from 'lucide-react';
import { ASSETS } from '../assets';
import { Message, DEFAULT_SETTINGS } from '../types/dashboard';
import { streamChatResponse, synthesizeSpeech, generateAiImage } from '../services/aiService';
import { MarkdownRenderer } from './dashboard/MarkdownRenderer';

interface ChatbotWidgetProps {
  onOpenDashboard?: () => void;
  externalOpen?: boolean;
  onCloseExternal?: () => void;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
  initialFullScreen?: boolean;
}

const STORAGE_KEY = 'aurora_quick_chatbot_messages';

const INITIAL_AURORA_MESSAGE: Message = {
  id: 'aurora_welcome_0',
  role: 'model',
  content: "Look who found me. I'm **Aurora** — your AI Senpai.\n\nI can chat at lightspeed, generate **AI anime artwork & images**, speak out loud in **Voice Mode**, and search live info on Google. What are we building or exploring today?",
  timestamp: Date.now(),
};

const STARTER_PROMPTS = [
  '🎨 Generate an image of cyberpunk Tokyo at night',
  'Tell me about your favorite anime world',
  'What anime is trending this season? (Search)',
  'Help me fix a tricky code bug',
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  externalOpen,
  onCloseExternal,
  initialPrompt,
  onPromptConsumed,
  initialFullScreen = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
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
      // fallback
    }
    return [INITIAL_AURORA_MESSAGE];
  });

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expression, setExpression] = useState<keyof typeof ASSETS.expressions>('happy');
  const [avatarSrc, setAvatarSrc] = useState(ASSETS.expressions.happy);
  const [bubbleTooltipVisible, setBubbleTooltipVisible] = useState(true);
  const [hasUnread, setHasUnread] = useState(false);

  // Voice Mode & Audio
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Image Generation Drawer State
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState<'1:1' | '16:9' | '9:16'>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<any>(null);

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

  // Sync initial full screen prop
  useEffect(() => {
    if (initialFullScreen) {
      setIsFullScreen(true);
      setIsOpen(true);
      setBubbleTooltipVisible(false);
    }
  }, [initialFullScreen]);

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
  }, [messages, isOpen, isGenerating, isGeneratingImage]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, isFullScreen]);

  // Auto-hide teaser tooltip after 8s
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
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setPlayingAudioId(null);
      }
      setIsFullScreen(false);
      onCloseExternal?.();
    }
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen((prev) => !prev);
  };

  // Play audio speech for a given text
  const playSpeechForText = async (text: string, messageId: string) => {
    if (playingAudioId === messageId && audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
      return;
    }

    try {
      setPlayingAudioId(messageId);
      const audioUrl = await synthesizeSpeech(text);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => {
        setPlayingAudioId(null);
      };
      audio.onerror = () => {
        setPlayingAudioId(null);
      };
      await audio.play();
    } catch (e) {
      console.warn('Voice playback error:', e);
      setPlayingAudioId(null);
    }
  };

  // Voice speech recognition input (Speech-to-Text)
  const toggleListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  // Dedicated Image Generation Action
  const handleGenerateImage = async (customPrompt?: string) => {
    const targetPrompt = (customPrompt || imagePrompt).trim();
    if (!targetPrompt || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setImageError(null);
    setShowImageStudio(false);
    setExpression('serious');

    const userMsg: Message = {
      id: `usr_img_${Date.now()}`,
      role: 'user',
      content: `🎨 Generate image: "${targetPrompt}" (${imageAspectRatio})`,
      timestamp: Date.now(),
    };

    const auroraImagePlaceholder: Message = {
      id: `aur_img_${Date.now()}`,
      role: 'model',
      content: 'Generating artwork in the neural studio...',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg, auroraImagePlaceholder]);

    try {
      const result = await generateAiImage({
        prompt: targetPrompt,
        aspectRatio: imageAspectRatio,
        style: 'anime',
      });

      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.id === auroraImagePlaceholder.id) {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: `Here is your generated artwork for **"${targetPrompt}"**! What do you think, Kouhai? ♡`,
              image: {
                url: result.imageUrl,
                prompt: targetPrompt,
                aspectRatio: imageAspectRatio,
              },
            },
          ];
        }
        return prev;
      });

      setExpression('excited');
      setTimeout(() => setExpression('happy'), 4000);
      setImagePrompt('');
    } catch (err: any) {
      console.error('Image generation error:', err);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.id === auroraImagePlaceholder.id) {
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: `*Sigh*... The canvas glitched while rendering: ${err?.message || 'Unable to generate'}. Let's try again in a moment.`,
              error: true,
            },
          ];
        }
        return prev;
      });
      setExpression('pouty');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend ?? input).trim();
    if (!prompt || isGenerating || isGeneratingImage) return;

    // Check if the user is asking to generate an image
    const imageMatch = prompt.match(/^(?:🎨\s*)?(?:generate(?:\s+an?)?\s+image(?:\s+of)?|create(?:\s+an?)?\s+image(?:\s+of)?|\/image|draw(?:\s+a|\s+an|\s+picture\s+of)?|paint(?:\s+a|\s+an|\s+picture\s+of)?)\s*:?\s*(.+)$/i);
    if (imageMatch && imageMatch[1]) {
      setInput('');
      await handleGenerateImage(imageMatch[1].trim());
      return;
    }

    setInput('');
    setBubbleTooltipVisible(false);

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    }

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
      sources: [],
    };

    const updatedMessages = [...messages, userMsg];
    setMessages([...updatedMessages, auroraPlaceholder]);
    setIsGenerating(true);
    setExpression('serious');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const finalAccumulated = await streamChatResponse({
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
        onGrounding: (sources) => {
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.id === auroraPlaceholder.id) {
              return [
                ...prev.slice(0, -1),
                { ...last, sources },
              ];
            }
            return prev;
          });
        },
      });

      setExpression('excited');
      setTimeout(() => setExpression('happy'), 4000);

      // Auto-voice playback if Voice Mode is active
      if (isVoiceMode && finalAccumulated) {
        playSpeechForText(finalAccumulated, auroraPlaceholder.id);
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
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

  const handleNewChat = () => {
    if (isGenerating) handleStopGenerating();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    }
    setInput('');
    setMessages([INITIAL_AURORA_MESSAGE]);
    setExpression('happy');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleClearConversation = () => {
    if (isGenerating) handleStopGenerating();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setPlayingAudioId(null);
    }
    setInput('');
    setMessages([]);
    setExpression('happy');
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleResetChat = handleNewChat;

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

  if (!isOpen) {
    return null;
  }

  return (
    <aside aria-label="Aurora AI Assistant Chatbot" className={isFullScreen ? 'fixed inset-0 z-50' : 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50'}>
      <section
        aria-label="Aurora Chat Workspace"
        className={
          isFullScreen
            ? 'fixed inset-0 z-50 w-screen h-screen bg-[#070916] flex flex-col overflow-hidden animate-fade-in'
              : 'relative w-[calc(100vw-32px)] sm:w-[440px] h-[620px] max-h-[86vh] bg-[#070916]/95 border border-white/15 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-fade-in'
          }
          style={{
            boxShadow: isFullScreen
              ? 'none'
              : '0 0 35px rgba(11, 0, 207, 0.25), 0 25px 70px rgba(0,0,0,0.9)',
          }}
        >
          {/* Ambient Header Glow */}
          <div
            className="absolute top-0 left-0 right-0 h-28 pointer-events-none opacity-30 blur-2xl"
            style={{
              background: 'linear-gradient(90deg, #0B00CF, #C10823)',
            }}
          />

          {/* Header */}
          <header className="relative z-10 px-4 py-3 sm:px-6 sm:py-3.5 bg-[#0B0E24]/90 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mini Avatar */}
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-white/20 bg-[#121630] shrink-0 shadow-md">
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
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Aurora</h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-[#FF2D2B]/20 text-[#FF2D2B] border border-[#FF2D2B]/30 font-semibold">
                    Senpai AI
                  </span>
                  {isFullScreen && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                      Full Screen Mode
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#94A3B8]">
                  <span>{isGenerating ? 'Streaming...' : isGeneratingImage ? 'Painting AI Artwork...' : 'Ultra-Fast • Image & Voice Enabled'}</span>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Image Studio Trigger */}
              <button
                type="button"
                onClick={() => setShowImageStudio(!showImageStudio)}
                title="AI Image Generator Studio"
                aria-label="Generate Image"
                className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                  showImageStudio
                    ? 'bg-[#FF2D2B]/25 border-[#FF2D2B]/50 text-white shadow-md'
                    : 'bg-white/5 border-white/10 text-[#CBD5E1] hover:text-white hover:bg-white/10'
                }`}
              >
                <ImageIcon className="w-4 h-4 text-[#FF2D2B]" />
                <span className="hidden sm:inline">Images</span>
              </button>

              {/* Voice Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                title={isVoiceMode ? 'Voice Mode Active' : 'Enable Voice Mode'}
                aria-label="Toggle Voice Mode"
                className={`p-1.5 sm:p-2 rounded-lg border transition-all cursor-pointer ${
                  isVoiceMode
                    ? 'bg-[#10B981]/20 border-[#10B981]/40 text-[#10B981]'
                    : 'bg-white/5 border-white/10 text-[#94A3B8] hover:text-white'
                }`}
              >
                {isVoiceMode ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Fullscreen Toggle Button */}
              <button
                type="button"
                onClick={handleToggleFullScreen}
                title={isFullScreen ? 'Exit Full Screen' : 'Expand to Full Screen'}
                aria-label="Toggle Full Screen"
                className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* New Chat Button */}
              <button
                type="button"
                onClick={handleNewChat}
                title="Start a new chat session"
                aria-label="New chat"
                className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span className="hidden sm:inline">New Chat</span>
              </button>

              {/* Clear Conversation Button */}
              <button
                type="button"
                onClick={handleClearConversation}
                title="Clear entire conversation"
                aria-label="Clear Conversation"
                className="p-1.5 sm:p-2 rounded-lg text-[#94A3B8] hover:text-[#FF2D2B] hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Close/Minimize */}
              <button
                type="button"
                onClick={handleToggle}
                title="Minimize chatbot"
                aria-label="Minimize chatbot"
                className="p-1.5 sm:p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Quick AI Image Studio Drawer */}
          {showImageStudio && (
            <div className="px-4 py-3 bg-[#0B0F2B] border-b border-[#FF2D2B]/30 animate-fade-in text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-[#FF2D2B]" />
                  AI Image Generator Studio
                </span>
                <span className="text-[10px] text-[#94A3B8]">Aspect Ratio:</span>
                <div className="flex items-center gap-1">
                  {(['1:1', '16:9', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setImageAspectRatio(ratio)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer border ${
                        imageAspectRatio === ratio
                          ? 'bg-[#FF2D2B] text-white border-[#FF2D2B]'
                          : 'bg-white/5 text-[#94A3B8] border-white/10 hover:text-white'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="e.g. Cyberpunk Aurora in neon rain, Makoto Shinkai style..."
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
                  <span>{isGeneratingImage ? 'Generating...' : 'Create'}</span>
                </button>
              </div>

              {imageError && (
                <div className="text-[11px] text-rose-400">{imageError}</div>
              )}
            </div>
          )}

          {/* Messages Container */}
          <div className={`flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scroll-smooth ${isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
            {messages.length === 0 && (
              <div className="py-12 text-center space-y-3 animate-fade-in">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-[#94A3B8]">
                  <Zap className="w-6 h-6 text-[#FF2D2B]" />
                </div>
                <h4 className="text-sm font-semibold text-white">Conversation Cleared</h4>
                <p className="text-xs text-[#94A3B8] max-w-xs mx-auto">
                  Chat memory has been cleared. Say hi or pick a topic to start fresh.
                </p>
                <button
                  type="button"
                  onClick={handleNewChat}
                  className="btn-aurora-gradient text-xs px-4 py-2 rounded-xl text-white font-medium inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Fresh Session</span>
                </button>
              </div>
            )}
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isPlaying = playingAudioId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <div
                    className={`relative text-xs sm:text-[13px] leading-relaxed max-w-[92%] sm:max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-md ${
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
                          <div>
                            <MarkdownRenderer content={msg.content} />

                            {/* Render AI Generated Image if present */}
                            {msg.image && (
                              <div className="mt-3 rounded-xl overflow-hidden border border-white/15 bg-black/40 group relative shadow-2xl">
                                <img
                                  src={msg.image.url}
                                  alt={msg.image.prompt}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-auto max-h-[460px] object-contain rounded-xl select-none"
                                />
                                <div className="p-2.5 bg-[#090C1F]/90 border-t border-white/10 flex items-center justify-between text-xs">
                                  <span className="text-[#CBD5E1] truncate pr-2 font-mono text-[11px]">
                                    "{msg.image.prompt}"
                                  </span>
                                  <a
                                    href={msg.image.url}
                                    download={`aurora-art-${Date.now()}.jpg`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1 text-[11px] shrink-0 transition-colors"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>
                            )}

                            {/* Grounding Source Citations (Google Search & Maps) */}
                            {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t border-white/10">
                                <div className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                  <Compass className="w-3 h-3 text-[#38BDF8]" />
                                  <span>Grounded Sources:</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {msg.sources.map((src, i) => (
                                    <a
                                      key={i}
                                      href={src.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-[10px] text-[#38BDF8] hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded border border-white/10 transition-colors truncate max-w-[200px]"
                                      title={src.title}
                                    >
                                      <span className="truncate">{src.title}</span>
                                      <span className="text-white/40">↗</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Message actions: Play speech aloud */}
                            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                              <button
                                type="button"
                                onClick={() => playSpeechForText(msg.content, msg.id)}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors cursor-pointer ${
                                  isPlaying
                                    ? 'bg-[#FF2D2B]/20 text-[#FF2D2B] font-semibold'
                                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>{isPlaying ? 'Playing voice...' : 'Listen'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 py-1 text-[#94A3B8] text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B] animate-bounce" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B] animate-bounce [animation-delay:0.15s]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B] animate-bounce [animation-delay:0.3s]" />
                            <span className="ml-1 text-[11px] font-mono text-[#CBD5E1]">
                              Aurora is responding...
                            </span>
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
            {messages.length <= 2 && !isGenerating && !isGeneratingImage && (
              <div className="pt-2 pb-1">
                <p className="text-[11px] font-mono text-[#94A3B8] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[#FF2D2B]" />
                  Suggested conversation sparks:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

          {/* Footer Composer with Image Tool, Voice Input & Send */}
          <footer className="p-3 sm:p-4 bg-[#0B0E24]/95 border-t border-white/10 shrink-0">
            <div className={isFullScreen ? 'max-w-4xl mx-auto w-full' : ''}>
              <div className="relative flex items-center rounded-xl bg-[#060814] border border-white/15 focus-within:border-[#0B00CF] transition-colors shadow-inner">
                {/* Generate Image Button shortcut */}
                <button
                  type="button"
                  onClick={() => setShowImageStudio(!showImageStudio)}
                  title="Generate Image with AI"
                  aria-label="Generate Image"
                  className="p-2 ml-1 rounded-lg text-[#FF2D2B] hover:bg-white/5 transition-all cursor-pointer"
                >
                  <Wand2 className="w-4 h-4" />
                </button>

                {/* Mic Speech-to-Text Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? 'Listening... click to stop' : 'Voice input (Speech to text)'}
                  aria-label="Voice input"
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isListening
                      ? 'bg-[#FF2D2B]/30 text-[#FF2D2B] animate-pulse'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4 text-[#FF2D2B]" /> : <Mic className="w-4 h-4" />}
                </button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isListening
                      ? 'Listening to your voice...'
                      : 'Ask Aurora anything, or type "/image <prompt>"... (Enter to send)'
                  }
                  rows={1}
                  disabled={isGenerating || isGeneratingImage}
                  className="w-full bg-transparent px-2.5 py-2.5 text-xs sm:text-sm text-white placeholder-[#64748B] focus:outline-none resize-none max-h-28 disabled:opacity-50"
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
                      className="p-1.5 sm:p-2 rounded-lg text-white bg-gradient-to-r from-[#0B00CF] to-[#FF2D2B] disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <span>Enter to send</span>
                  <span>•</span>
                  <span>Type /image for art</span>
                  <span>•</span>
                  <span>Voice enabled</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#94A3B8]">
                  Aurora Ultra-Fast • Gemini 3.8
                </span>
              </div>
            </div>
          </footer>
        </section>
    </aside>
  );
};
