import React from 'react';
import { X, MessageSquare } from 'lucide-react';
import { TopicItem } from './TopicsSection';

interface TopicDetailModalProps {
  topic: TopicItem | null;
  onClose: () => void;
  onOpenAuth: (mode: 'signup') => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({
  topic,
  onClose,
  onOpenAuth
}) => {
  if (!topic) return null;

  const Icon = topic.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#080B1B] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow */}
        <div
          className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[90px] pointer-events-none opacity-30"
          style={{ background: '#0B00CF' }}
          aria-hidden="true"
        />

        {/* Subtle real-life topic photo backdrop */}
        {topic.bgImage && (
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-10">
            <img
              src={topic.bgImage}
              alt={topic.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close topic preview"
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-white transition-colors cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-xl bg-[#0F142D] border border-white/10 flex items-center justify-center text-[#FF2D2B]">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono tracking-wider text-[#FF2D2B] uppercase">
              {topic.tag} · PREVIEW
            </span>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {topic.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
          {topic.description}
        </p>

        {/* Senpai Voice Callout */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0B00CF]/15 to-[#300A6E]/20 border border-[#0B00CF]/30 mb-6 relative">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#FF2D2B]" />
            <span>Aurora's Unfiltered Take</span>
          </div>
          <p className="text-sm text-[#E2E8F0] italic leading-relaxed">
            "{topic.senpaiQuote}"
          </p>
          <div className="mt-2 text-right">
            <span className="font-handwriting text-lg text-[#FF2D2B]">
              — Aurora ♡
            </span>
          </div>
        </div>

        {/* Conversation Starter Sample */}
        <div className="mb-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-2 text-xs font-medium text-[#94A3B8] mb-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#0B00CF]" />
            <span>Upcoming Dialogue Topics</span>
          </div>
          <p className="text-xs text-[#CBD5E1] leading-relaxed">
            {topic.sampleQuestion}
          </p>
        </div>

        {/* Actions & Next Phase Notice */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-[#64748B]">
            Interactive chat powered by Gemini AI unlocks in Phase 2.
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenAuth('signup');
            }}
            className="btn-aurora-gradient w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer whitespace-nowrap"
          >
            Get Early Access
          </button>
        </div>
      </div>
    </div>
  );
};
