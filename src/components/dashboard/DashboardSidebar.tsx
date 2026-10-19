import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Sliders,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Home,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Conversation, PersonalitySettings } from '../../types/dashboard';
import { ASSETS } from '../../assets';

interface DashboardSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onBackToHome: () => void;
  settings: PersonalitySettings;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onRenameConversation,
  onDeleteConversation,
  onOpenSettings,
  onBackToHome,
  settings,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState(ASSETS.logo);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, searchQuery]);

  // Group conversations by relative time
  const groupedConversations = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const groups: { label: string; items: Conversation[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Yesterday', items: [] },
      { label: 'Previous 7 Days', items: [] },
      { label: 'Older', items: [] },
    ];

    filteredConversations.forEach((c) => {
      const diff = now - c.updatedAt;
      if (diff < oneDay) {
        groups[0].items.push(c);
      } else if (diff < 2 * oneDay) {
        groups[1].items.push(c);
      } else if (diff < 7 * oneDay) {
        groups[2].items.push(c);
      } else {
        groups[3].items.push(c);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [filteredConversations]);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const confirmDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteCandidateId(id);
  };

  const executeDelete = () => {
    if (deleteCandidateId) {
      onDeleteConversation(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidateId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-sm bg-[#0E122B] border border-white/10 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Delete Conversation?</h4>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed mb-5">
              This will permanently remove this chat and its messages from your browser storage. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidateId(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDelete}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition-colors shadow-md cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 bg-[#08080E] border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 w-72 sm:w-80'
            : '-translate-x-full md:translate-x-0 ' + (isCollapsed ? 'md:w-16' : 'md:w-72 lg:w-80')
        }`}
      >
        {/* Brand Area */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-[#0F142D] border border-white/10">
              <img
                src={logoSrc}
                onError={() => {
                  if (logoSrc !== ASSETS.logoFallback) setLogoSrc(ASSETS.logoFallback);
                }}
                alt="Aurora"
                className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(11,0,207,0.8)]"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold tracking-wider text-white truncate">
                    AURORA
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FF2D2B]/15 text-[#FF2D2B] border border-[#FF2D2B]/30 font-mono">
                    AI
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online · Senpai Mode</span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Mobile Close Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={onCloseMobile}
              aria-label="Close mobile sidebar"
              className="md:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Primary Action: New Chat */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            title="Start new conversation"
            className={`w-full py-2.5 rounded-xl font-semibold text-xs text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
              isCollapsed
                ? 'px-0 bg-[#0B00CF] hover:bg-[#0B00CF]/80'
                : 'px-4 btn-aurora-gradient'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Search Bar (Only when expanded) */}
        {!isCollapsed && (
          <div className="px-3 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[#0F142D]/80 border border-white/5 text-xs text-white placeholder-[#64748B] focus:outline-none focus:border-[#0B00CF]/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2">
          {isCollapsed ? (
            // Collapsed view icons
            <div className="flex flex-col items-center gap-1.5">
              {filteredConversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectConversation(c.id)}
                    title={c.title}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#0B00CF]/30 border border-[#0B00CF] text-white shadow-[0_0_12px_rgba(11,0,207,0.4)]'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            // Expanded view with groups
            <>
              {groupedConversations.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[#94A3B8] mb-2.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-semibold text-white/80">No conversations yet</p>
                  <p className="text-[11px] text-[#94A3B8] mt-0.5">
                    {searchQuery ? 'No chats match your search query.' : "Click 'New Chat' to start talking with Aurora."}
                  </p>
                </div>
              ) : (
                groupedConversations.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
                      {group.label}
                    </div>
                    {group.items.map((conv) => {
                      const isActive = conv.id === activeId;
                      const isEditing = conv.id === editingId;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            onSelectConversation(conv.id);
                            onCloseMobile();
                          }}
                          className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-[#0B00CF]/25 to-[#300A6E]/25 border border-[#0B00CF]/60 text-white font-medium shadow-md'
                              : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent'
                          }`}
                        >
                          {isEditing ? (
                            <form
                              onSubmit={(e) => saveRename(conv.id, e)}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 w-full"
                            >
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                autoFocus
                                className="w-full bg-[#080B1E] border border-[#0B00CF] rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                              />
                              <button
                                type="submit"
                                aria-label="Save title"
                                className="text-emerald-400 hover:text-emerald-300 p-0.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                aria-label="Cancel rename"
                                className="text-[#94A3B8] hover:text-white p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                                <MessageSquare
                                  className={`w-3.5 h-3.5 shrink-0 ${
                                    isActive ? 'text-[#FF2D2B]' : 'text-[#64748B] group-hover:text-white/60'
                                  }`}
                                />
                                <span className="truncate">{conv.title}</span>
                              </div>

                              {/* Hover actions */}
                              <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => startRename(conv, e)}
                                  title="Rename chat"
                                  className="p-1 rounded hover:bg-white/10 text-[#94A3B8] hover:text-white transition-colors"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => confirmDelete(conv.id, e)}
                                  title="Delete chat"
                                  className="p-1 rounded hover:bg-white/10 text-[#94A3B8] hover:text-rose-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* Bottom Actions & User Account Area */}
        <div className="p-3 border-t border-white/5 bg-[#05060A] shrink-0 space-y-1">
          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Aurora Settings"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0 text-[#A5B4FC]" />
            {!isCollapsed && <span>Personality & Settings</span>}
          </button>

          {/* Return to Website Button */}
          <button
            onClick={onBackToHome}
            title="Return to Aurora Homepage"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Home className="w-4 h-4 shrink-0 text-[#FF2D2B]" />
            {!isCollapsed && <span>Back to Website</span>}
          </button>

          {/* User Profile Pill */}
          {!isCollapsed && (
            <div className="pt-2 mt-1 border-t border-white/5 flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0B00CF] to-[#FF2D2B] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                  {settings.userName.charAt(0).toUpperCase() || 'K'}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-semibold text-white truncate">
                    {settings.userName}
                  </span>
                  <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-[#FF2D2B]" />
                    {settings.intensity === 'playful' ? 'Playful Senpai' : settings.intensity === 'calm' ? 'Calm Senpai' : 'Expressive'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
