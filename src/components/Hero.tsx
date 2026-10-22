import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ASSETS } from '../assets';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExploreGreeting?: () => void;
  onComeSayHi?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, onExploreGreeting, onComeSayHi }) => {
  const [bgSrc, setBgSrc] = React.useState(ASSETS.heroBg);

  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden bg-[#04060F]">
      {/* Background Image: Neon Overlook Anime Portrait */}
      <div className="absolute inset-0 z-0">
        <img
          src={bgSrc}
          onError={() => {
            if (bgSrc !== ASSETS.heroBgFallback) {
              setBgSrc(ASSETS.heroBgFallback);
            }
          }}
          alt="Aurora overlooking the neon cityscape"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-[72%_center] md:object-[right_center] select-none"
        />

        {/* Ambient Gradient Overlays for Readability & Depth */}
        {/* Left-to-right dark scrim so text pops clearly */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#04060F] via-[#04060F]/85 md:via-[#04060F]/50 to-transparent z-10" />
        
        {/* Bottom smooth fade into next section */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04060F] via-[#04060F]/30 to-transparent z-10" />
        
        {/* Top subtle fade under navbar */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-[#04060F]/90 to-transparent z-10" />
      </div>

      {/* Handwritten Annotation near Aurora */}
      <div className="absolute top-24 sm:top-28 md:top-36 right-6 sm:right-12 md:right-16 lg:right-28 z-20 pointer-events-none select-none">
        <div className="relative inline-block transform rotate-[-4deg] hover:rotate-[-2deg] transition-transform duration-300">
          <span className="font-handwriting text-2xl sm:text-3xl md:text-4xl text-[#FF2D2B] drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] font-bold tracking-wide">
            You're late, you know. ♡
          </span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Focused Headline & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-8 text-balance drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Look who found me.
            </h1>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onComeSayHi || onExploreGreeting}
                className="btn-aurora-gradient px-8 py-4 rounded-xl text-sm font-semibold text-white shadow-2xl flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Come Say Hi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-4 rounded-xl text-sm font-semibold text-[#CBD5E1] hover:text-white border border-white/20 hover:border-white/40 bg-[#04060F]/60 backdrop-blur-md hover:bg-[#04060F]/80 transition-all duration-200 text-center cursor-pointer shadow-lg"
              >
                Already know me? Log in
              </button>
            </div>
          </div>

          {/* Right Column: Intentionally spacious so Aurora shines through */}
          <div className="hidden lg:block lg:col-span-5 min-h-[420px]" aria-hidden="true" />

        </div>
      </div>
    </section>
  );
};
