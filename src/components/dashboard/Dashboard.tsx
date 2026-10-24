import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Sliders,
  LogOut,
  User,
  MessageSquare,
  Plus,
  PanelLeft,
  ChevronDown,
  Globe,
  Check,
} from 'lucide-react';
import { Conversation, Message, PersonalitySettings } from '../../types/dashboard';
import { UserProfile } from '../../types/auth';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadSettings,
  saveSettings,
} from '../../services/dashboardStorage';
import { streamChatResponse, GroundingSource } from '../../services/aiService';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardChat } from './DashboardChat';
import { DashboardSettingsModal } from './DashboardSettingsModal';
import { AudioTranscriberModal } from '../AudioTranscriberModal';
import { ASSETS } from '../../assets';

interface DashboardProps {
  onBackToHome: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onBackToHome,
  currentUser,
  onLogout,
  onOpenAuth,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations());
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveConversationId());
  const [settings, setSettings] = useState<PersonalitySettings>(() => loadSettings());
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchMode, setResearchMode] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAudioTranscriberOpen, setIsAudioTranscriberOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(ASSETS.logo);

  const abortControllerRef = useRef<AbortController | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Synchronize active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  // Persist conversations on change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  // Persist active ID on change
  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  // Persist settings on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If no conversation exists on initial mount, initialize one
  useEffect(() => {
    if (conversations.length === 0) {
      const initialConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: 'New Conversation',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations([initialConv]);
      setActiveId(initialConv.id);
    } else if (!activeId || !conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0].id);
    }
  }, []);

  // Actions
  const handleNewChat = () => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
    }
    const newConv: Conversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
    }
    setActiveId(id);
    setIsSidebarOpen(false);
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleDeleteConversation = (id: string) => {
    if (isGenerating && activeId === id) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
    }
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (remaining.length === 0) {
        const fresh: Conversation = {
          id: `conv_${Date.now()}`,
          title: 'New Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) {
        setActiveId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleClearConversation = () => {
    if (!activeId) return;
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [], updatedAt: Date.now() } : c))
    );
  };

  const handleSendMessage = async (text: string, options?: { enableResearch?: boolean }) => {
    if (!text.trim() || isGenerating) return;

    let targetConvId = activeId;
    let targetConv = activeConversation;

    if (!targetConvId || !targetConv) {
      const freshConv: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: text.length > 28 ? `${text.slice(0, 28)}...` : text,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      targetConvId = freshConv.id;
      targetConv = freshConv;
      setConversations((prev) => [freshConv, ...prev]);
      setActiveId(freshConv.id);
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const modelMessageId = `msg_${Date.now() + 1}_${Math.random().toString(36).slice(2, 7)}`;
    const assistantPlaceholder: Message = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
    };

    // Auto-update conversation title if it's the first message
    const updatedTitle =
      targetConv.messages.length === 0 && targetConv.title === 'New Conversation'
        ? text.length > 30
          ? `${text.slice(0, 30)}...`
          : text
        : targetConv.title;

    const updatedMessages = [...targetConv.messages, userMessage, assistantPlaceholder];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetConvId
          ? {
              ...c,
              title: updatedTitle,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let accumulated = '';
      await streamChatResponse({
        messages: [...targetConv.messages, userMessage],
        settings,
        signal: controller.signal,
        enableResearch: options?.enableResearch ?? researchMode,
        onChunk: (chunk) => {
          accumulated += chunk;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === targetConvId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === modelMessageId ? { ...m, content: accumulated } : m
                    ),
                  }
                : c
            )
          );
        },
        onGrounding: (sources: GroundingSource[]) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === targetConvId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === modelMessageId ? { ...m, sources } : m
                    ),
                  }
                : c
            )
          );
        },
      });
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('Chat error:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to reach Aurora service.';

      setConversations((prev) =>
        prev.map((c) =>
          c.id === targetConvId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === modelMessageId
                    ? {
                        ...m,
                        content: errMsg,
                        error: true,
                      }
                    : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleRegenerate = async () => {
    if (!activeConversation || activeConversation.messages.length < 2 || isGenerating || !activeId) {
      return;
    }

    const messages = activeConversation.messages;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'model') return;

    const history = messages.slice(0, -1);
    const modelMessageId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const assistantPlaceholder: Message = {
      id: modelMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...history, assistantPlaceholder],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let accumulated = '';
      await streamChatResponse({
        messages: history,
        settings,
        signal: controller.signal,
        enableResearch: researchMode,
        onChunk: (chunk) => {
          accumulated += chunk;
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === modelMessageId ? { ...m, content: accumulated } : m
                    ),
                  }
                : c
            )
          );
        },
        onGrounding: (sources: GroundingSource[]) => {
          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === modelMessageId ? { ...m, sources } : m
                    ),
                  }
                : c
            )
          );
        },
      });
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      console.error('Chat regeneration error:', err);
      const errMsg = err instanceof Error ? err.message : 'Failed to reach Aurora service.';

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === modelMessageId ? { ...m, content: errMsg, error: true } : m
                ),
              }
            : c
        )
      );
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  const displayName = currentUser?.name || settings.userName || 'Kouhai';
  const displayEmail = currentUser?.email || 'Guest Session';

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#04060F] text-[#F8FAFC] relative select-none">
      {/* Ambient Lighting & Glow Backdrops (Midnight Navy, Electric Blue, Violet, Crimson) */}
      <div
        className="pointer-events-none fixed -top-40 -left-40 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(circle, #0B00CF 0%, rgba(11,0,207,0) 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed -bottom-40 -right-40 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full blur-[140px] opacity-15"
        style={{
          background: 'radial-gradient(circle, #FF2D2B 0%, rgba(255,45,43,0) 70%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full blur-[180px] opacity-10"
        style={{
          background: 'radial-gradient(circle, #4C1D95 0%, rgba(76,29,149,0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* A. Header — Slim, Elegant Glass Header */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-[#06081A]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        {/* Left: Brand Mark & Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            onClick={onBackToHome}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Return to Aurora Homepage"
          >
            <div className="relative w-8 h-8 rounded-xl bg-[#0F1436] border border-[#FF2D2B]/30 flex items-center justify-center p-1.5 shrink-0 group-hover:border-[#FF2D2B] transition-colors shadow-sm">
              <img
                src={logoSrc}
                onError={() => {
                  if (logoSrc !== ASSETS.logoFallback) {
                    setLogoSrc(ASSETS.logoFallback);
                  }
                }}
                alt="Aurora AI"
                className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,45,43,0.5)]"
              />
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-[0.25em] text-white group-hover:text-[#60A5FA] transition-colors">
              AURORA
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Small Status Indicator showing assistant availability */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-emerald-300 hidden sm:inline">
              Available
            </span>
            <span className="text-[10px] font-mono text-emerald-400/80 hidden md:inline">
              • Gemini 3.8 Flash
            </span>
          </div>
        </div>

        {/* Center / Navigation Actions */}
        <div className="flex items-center gap-2">
          {/* Chats Slide-over Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            title="View Conversation History"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isSidebarOpen
                ? 'bg-[#0B00CF]/25 border-[#0B00CF]/50 text-white shadow-sm'
                : 'bg-white/5 border-white/10 text-[#CBD5E1] hover:text-white hover:bg-white/10'
            }`}
          >
            <PanelLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chats</span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] text-[#94A3B8] font-mono">
              {conversations.length}
            </span>
          </button>

          {/* New Chat Button */}
          <button
            type="button"
            onClick={handleNewChat}
            title="Start New Chat"
            className="btn-aurora-gradient px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>

        {/* Right: Actions, Settings, and User Profile Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Back to Home Button */}
          <button
            type="button"
            onClick={onBackToHome}
            title="Return to Website"
            className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer hidden md:flex items-center gap-1.5 text-xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Website</span>
          </button>

          {/* Assistant Settings */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            title="Aurora Assistant Settings"
            className="p-2 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/5 border border-white/5 transition-colors cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-[#A5B4FC]" />
          </button>

          {/* User Profile Menu or Sign in with Google */}
          {!currentUser ? (
            <button
              type="button"
              onClick={() => onOpenAuth?.('login')}
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Sign in with Google</span>
              <span className="sm:hidden">Sign in</span>
            </button>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20 shadow-sm"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0B00CF] to-[#FF2D2B] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-white hidden sm:inline max-w-[110px] truncate">
                  {displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#080B1F]/95 backdrop-blur-2xl border border-white/15 p-2 shadow-2xl z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-2 border-b border-white/10">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-[#94A3B8] truncate">{displayEmail}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsSettingsModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#CBD5E1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#A5B4FC]" />
                    <span>Account & Persona Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAudioTranscriberOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#CBD5E1] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#60A5FA]" />
                    <span>Voice Transcriber</span>
                  </button>

                  <div className="pt-1 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace: Centered Glassmorphic Chat Panel */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Slide-over Conversation History Drawer */}
        <DashboardSidebar
          conversations={conversations}
          activeId={activeId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenAudioTranscriber={() => setIsAudioTranscriberOpen(true)}
          onBackToHome={onBackToHome}
          currentUser={currentUser}
          onLogout={onLogout}
          onOpenAuth={onOpenAuth}
          settings={settings}
          isCollapsed={false}
          onToggleCollapse={() => setIsSidebarOpen(false)}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Centerpiece Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden w-full relative">
          <DashboardChat
            conversation={activeConversation}
            onSendMessage={handleSendMessage}
            onRegenerate={handleRegenerate}
            isGenerating={isGenerating}
            onStopGenerating={handleStopGenerating}
            onClearConversation={handleClearConversation}
            onNewChat={handleNewChat}
            settings={settings}
            researchMode={researchMode}
            onToggleResearchMode={() => setResearchMode((prev) => !prev)}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <DashboardSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />

      {/* Voice Transcriber Modal */}
      <AudioTranscriberModal
        isOpen={isAudioTranscriberOpen}
        onClose={() => setIsAudioTranscriberOpen(false)}
        onSendToChat={(text: string) => {
          setIsAudioTranscriberOpen(false);
          handleSendMessage(text);
        }}
      />
    </div>
  );
};
