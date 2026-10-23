import React, { useState, useEffect, useRef } from 'react';
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
import { streamChatResponse } from '../../services/aiService';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardChat } from './DashboardChat';
import { DashboardContextPanel } from './DashboardContextPanel';
import { DashboardSettingsModal } from './DashboardSettingsModal';
import { AudioTranscriberModal } from '../AudioTranscriberModal';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

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
  };

  const handleSelectConversation = (id: string) => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
    }
    setActiveId(id);
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

  const handleClearMessages = () => {
    if (!activeId) return;
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
    }
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: [], updatedAt: Date.now() } : c))
    );
  };

  const handleSendMessage = async (text: string) => {
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

    // Auto-update conversation title if first message
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
      });
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        console.log('Chat generation aborted by user.');
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
    if (
      !activeConversation ||
      activeConversation.messages.length < 2 ||
      isGenerating ||
      !activeId
    ) {
      return;
    }

    const messages = activeConversation.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== 'model') return;

    // Keep the conversation history and remove only the old AI response.
    const history = messages.slice(0, -1);

    const modelMessageId = `msg_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 7)}`;

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

        onChunk: (chunk) => {
          accumulated += chunk;

          setConversations((prev) =>
            prev.map((c) =>
              c.id === activeId
                ? {
                    ...c,
                    messages: c.messages.map((m) =>
                      m.id === modelMessageId
                        ? { ...m, content: accumulated }
                        : m
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

      console.error('Chat regeneration error:', err);

      const errMsg =
        err instanceof Error
          ? err.message
          : 'Failed to reach Aurora service.';

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === modelMessageId
                    ? { ...m, content: errMsg, error: true }
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

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-[#08080D] text-[#F8FAFC]">
      {/* Left Sidebar */}
      <DashboardSidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onBackToHome={onBackToHome}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenAuth={onOpenAuth}
        settings={settings}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Center Chat Area */}
      <DashboardChat
        conversation={activeConversation}
        onSendMessage={handleSendMessage}
        onRegenerate={handleRegenerate}
        isGenerating={isGenerating}
        onStopGenerating={handleStopGenerating}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onToggleContextPanel={() => setIsContextPanelOpen((prev) => !prev)}
        isContextPanelOpen={isContextPanelOpen}
        settings={settings}
      />

      {/* Optional Right Context Panel */}
      <DashboardContextPanel
        isOpen={isContextPanelOpen}
        onClose={() => setIsContextPanelOpen(false)}
        conversation={activeConversation}
        settings={settings}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onClearMessages={handleClearMessages}
      />

      {/* Settings Modal */}
      <DashboardSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />
    </div>
  );
};
