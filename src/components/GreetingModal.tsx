import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { ASSETS } from '../assets';

interface GreetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: (mode: 'signup') => void;
  onScrollToTopics: () => void;
}

export const GreetingModal: React.FC<GreetingModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
  onScrollToTopics
}) => {
  const [avatarSrc, setAvatarSrc] = React.useState(ASSETS.heroBg);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-[#080B1B] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 rounded-full blur-[90px] pointer-events-none opacity-40"
          style={{ background: 'linear-gradient(90deg, #0B00CF, #C10823)' }}
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close introduction"
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-white transition-colors cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Senpai Expression Mini Avatar */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/20 bg-[#0F142D] shrink-0 shadow-md">
            <img
              src={avatarSrc}
              onError={() => {
                if (avatarSrc !== ASSETS.heroBgFallback) {
                  setAvatarSrc(ASSETS.heroBgFallback);
                }
              }}
              alt="Aurora smiling"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-[68%_25%] transform scale-135"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#FF2D2B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF2D2B]" />
              SENPAI TRANSMISSION
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Well, you actually clicked.
            </h3>
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 text-sm text-[#CBD5E1] leading-relaxed mb-6">
          <p>
            Don't worry, I won't bite... much.
          </p>
          <p>
            Right now, I'm setting up my full conversational neural interface powered by Google Gemini and live voice synthesis.
          </p>
          <p>
            Until the lounge opens in Phase 2, you can join the early access pass, explore the topics we'll be arguing about, or just stop pretending your taste in music is flawless.
          </p>
        </div>

        {/* Handwritten sign-off */}
        <div className="mb-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <span className="font-handwriting text-2xl text-[#FF2D2B]">
            See you very soon. ♡
          </span>
          <span className="text-xs text-[#64748B] font-mono">Phase 1 Preview</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenAuth('signup');
            }}
            className="btn-aurora-gradient w-full sm:w-auto flex-1 py-3 rounded-xl text-xs font-semibold text-white cursor-pointer flex items-center justify-center gap-2 group"
          >
            <span>Claim Early Access</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => {
              onClose();
              onScrollToTopics();
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-[#CBD5E1] hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors cursor-pointer text-center"
          >
            Explore Topics
          </button>
        </div>
      </div>
    </div>
  );
};
