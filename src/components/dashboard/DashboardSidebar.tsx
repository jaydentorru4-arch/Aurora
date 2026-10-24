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
  Mic,
  LogOut,
  User,
  AlertTriangle,
} from 'lucide-react';
import { Conversation, PersonalitySettings } from '../../types/dashboard';
import { UserProfile } from '../../types/auth';
import { ASSETS } from '../../assets';

interface DashboardSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onOpenSettings: () => void;
  onOpenAudioTranscriber?: () => void;
  onBackToHome: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
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
  onOpenAudioTranscriber,
  onBackToHome,
  currentUser,
  onLogout,
  onOpenAuth,
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

  const executeDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setDeleteCandidateId(null);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteCandidateId(null);
  };

  const displayName = currentUser?.name || settings.userName || 'User';
  const displayEmail = currentUser?.email || 'Guest Mode';

  return (
    <>
      {/* Backdrop overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#07091E]/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out w-80 max-w-[85vw] ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
          <div
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative w-9 h-9 rounded-xl bg-[#0F1436] border border-[#FF2D2B]/30 flex items-center justify-center p-1.5 shrink-0 group-hover:border-[#FF2D2B] transition-colors shadow-sm">
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

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-[0.2em] text-white group-hover:text-[#60A5FA] transition-colors">
                  AURORA
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#FF2D2B]/20 text-[#FF2D2B] border border-[#FF2D2B]/30 font-semibold">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] truncate">Conversation History</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close conversation drawer"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action: New Chat Button */}
        <div className="p-3 shrink-0">
          <button
            onClick={() => {
              onNewChat();
              if (isMobileOpen) onCloseMobile();
            }}
            title="Start New Chat"
            className={`btn-aurora-gradient w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Compact Search Bar (When Expanded) */}
        {!isCollapsed && conversations.length > 2 && (
          <div className="px-3 pb-2 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#050713] border border-white/10 rounded-xl text-xs text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
          {isCollapsed ? (
            /* Icon-Only Vertical Stack */
            <div className="space-y-1.5">
              {conversations.slice(0, 10).map((conv) => {
                const isActive = conv.id === activeId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => onSelectConversation(conv.id)}
                    title={conv.title}
                    className={`w-full h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#0B00CF]/30 border border-[#0B00CF]/50 text-white'
                        : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          ) : (
            /* Grouped Conversation View */
            <>
              {groupedConversations.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748B]">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p>No conversations found</p>
                </div>
              ) : (
                groupedConversations.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
                      {group.label}
                    </div>

                    {group.items.map((conv) => {
                      const isActive = conv.id === activeId;
                      const isEditing = editingId === conv.id;
                      const isDeleting = deleteCandidateId === conv.id;

                      if (isDeleting) {
                        return (
                          <div
                            key={conv.id}
                            className="p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-xs flex items-center justify-between gap-2 animate-fade-in"
                          >
                            <span className="text-[11px] text-red-200 flex items-center gap-1 truncate">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                              Delete this chat?
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => executeDelete(conv.id, e)}
                                className="px-2 py-0.5 rounded bg-red-500 text-white font-medium text-[11px] hover:bg-red-600 transition-colors cursor-pointer"
                              >
                                Yes
                              </button>
                              <button
                                type="button"
                                onClick={cancelDelete}
                                className="px-2 py-0.5 rounded bg-white/10 text-white font-medium text-[11px] hover:bg-white/20 transition-colors cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={conv.id}
                          onClick={() => {
                            onSelectConversation(conv.id);
                            if (isMobileOpen) onCloseMobile();
                          }}
                          className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                            isActive
                              ? 'bg-[#0B00CF]/20 border border-[#0B00CF]/40 text-white font-medium shadow-sm'
                              : 'text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent'
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
                                autoFocus
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-[#050713] border border-white/20 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-[#60A5FA]"
                              />
                              <button
                                type="submit"
                                className="p-1 hover:text-emerald-400 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="p-1 hover:text-red-400 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#60A5FA]' : 'text-[#64748B]'}`} />
                                <span className="truncate">{conv.title}</span>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

        {/* Bottom Actions & User Profile */}
        <div className="p-3 border-t border-white/10 bg-[#05060A] shrink-0 space-y-1">
          {/* Personality & Settings Button */}
          <button
            onClick={onOpenSettings}
            title="Aurora Assistant Settings"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#CBD5E1] hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0 text-[#A5B4FC]" />
            {!isCollapsed && <span>Assistant Settings</span>}
          </button>

          {/* Audio Transcriber (Optional) */}
          {onOpenAudioTranscriber && (
            <button
              onClick={onOpenAudioTranscriber}
              title="Audio Transcriber"
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
                isCollapsed ? 'justify-center px-0' : 'justify-start'
              }`}
            >
              <Mic className="w-4 h-4 shrink-0 text-[#60A5FA]" />
              {!isCollapsed && <span>Voice Transcriber</span>}
            </button>
          )}

          {/* Back to Home Button */}
          <button
            onClick={onBackToHome}
            title="Return to Aurora Homepage"
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'justify-start'
            }`}
          >
            <Home className="w-4 h-4 shrink-0 text-[#94A3B8]" />
            {!isCollapsed && <span>Back to Website</span>}
          </button>

          {/* User Account / Profile Box */}
          <div className="pt-2 mt-1 border-t border-white/10">
            {isCollapsed ? (
              <div className="flex justify-center">
                {currentUser ? (
                  <button
                    onClick={onLogout}
                    title={`Signed in as ${displayName} (${displayEmail}). Click to sign out.`}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B00CF] to-[#FF2D2B] flex items-center justify-center text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    {displayName.charAt(0).toUpperCase()}
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenAuth?.('login')}
                    title="Log in to Aurora"
                    className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : currentUser ? (
              <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={displayName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-white/20 shadow-sm"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0B00CF] to-[#FF2D2B] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                        {displayName}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#64748B] truncate max-w-[120px]">
                      {displayEmail}
                    </span>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    title="Sign Out"
                    aria-label="Sign Out"
                    className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="px-1">
                <button
                  type="button"
                  onClick={() => onOpenAuth?.('login')}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
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
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
