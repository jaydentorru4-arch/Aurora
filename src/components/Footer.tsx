import React from 'react';
import { ASSETS } from '../assets';

interface FooterProps {
  onOpenLegal: (topic: 'privacy' | 'terms' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="border-t border-white/5 py-12 bg-[#03040A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 flex items-center justify-center shrink-0">
                <img
                  src={ASSETS.logo}
                  alt="Aurora Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_6px_rgba(11,0,207,0.5)]"
                />
              </div>
              <span className="text-sm font-bold tracking-wider text-white">AURORA</span>
            </div>
            <span className="hidden sm:inline text-white/20">|</span>
            <p className="text-xs text-[#94A3B8]">
              Your AI senpai. Your conversations. Your pace.
            </p>
          </div>

          {/* Right: Clean Text Links */}
          <div className="flex items-center gap-6 text-xs text-[#94A3B8]">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <span className="text-white/10" aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms
            </button>
            <span className="text-white/10" aria-hidden="true">·</span>
            <button
              onClick={() => onOpenLegal('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>
        </div>

        {/* Small copyright note */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center">
          <p className="text-[11px] text-[#64748B]">
            &copy; {new Date().getFullYear()} Aurora AI. Character design & concept. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
