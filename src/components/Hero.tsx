import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExploreGreeting: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenAuth, onExploreGreeting }) => {
  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden">
      {/* Background Ambient Glows */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full blur-[140px] pointer-events-none opacity-25"
        style={{ background: '#0B00CF' }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 right-1/4 translate-x-1/3 translate-y-1/3 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: '#C10823' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Focused Headline & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05] mb-8 text-balance">
              Look who found me.
            </h1>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onExploreGreeting}
                className="btn-aurora-gradient px-8 py-4 rounded-xl text-sm font-semibold text-white shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Come Say Hi</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              <button
                onClick={() => onOpenAuth('login')}
                className="px-6 py-4 rounded-xl text-sm font-semibold text-[#CBD5E1] hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all duration-200 text-center cursor-pointer"
              >
                Already know me? Log in
              </button>
            </div>
          </div>

          {/* Right Column: Aurora Character Artwork on the Right Hand */}
          <div className="lg:col-span-6 flex justify-center lg:justify-end items-center relative">
            {/* Cinematic rim illumination highlights */}
            <div
              className="absolute -inset-4 rounded-3xl opacity-30 blur-2xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(11,0,207,0.5) 0%, rgba(48,10,110,0.3) 50%, rgba(193,8,35,0.4) 100%)'
              }}
              aria-hidden="true"
            />

            <div className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-[460px] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_-15px_rgba(5,7,19,0.9)] bg-[#070914] group">
              {/* Electric blue rim line on left edge & crimson on right */}
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#0B00CF] via-transparent to-transparent opacity-75 z-20" />
              <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-transparent via-[#FF2D2B] to-[#C10823] opacity-75 z-20" />

              {/* Character Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#0A0D1D]">
                <img
                  src="/src/assets/images/aurora_hero_portrait_1792173932452.jpg"
                  alt="Aurora, a stylish Japanese AI senpai with dark hair, electric-blue and crimson highlights, modern streetwear techwear jacket, and mischievous smile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform scale-[1.01] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />

                {/* Soft edge gradient overlay for seamless blending */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060F] via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#04060F]/30 via-transparent to-[#04060F]/30 pointer-events-none" />
              </div>

              {/* Handwritten Annotation directly beside Aurora */}
              <div className="absolute top-6 right-5 z-20 pointer-events-none select-none">
                <div className="relative inline-block transform rotate-[-4deg] group-hover:rotate-[-2deg] transition-transform duration-300">
                  <span className="font-handwriting text-2xl sm:text-3xl text-[#FF2D2B] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-bold tracking-wide">
                    You're late, you know. ♡
                  </span>
                </div>
              </div>

              {/* Senpai presence badge in quiet typography */}
              <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs text-white/80 px-3.5 py-2 rounded-lg bg-[#04060F]/80 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FF2D2B] shadow-[0_0_8px_#FF2D2B]" />
                  <span className="font-semibold text-white tracking-wide">Aurora</span>
                  <span className="text-white/40">·</span>
                  <span className="text-[#94A3B8]">AI Senpai</span>
                </div>
                <span className="text-[11px] text-[#94A3B8] font-mono">v1.0 Preview</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
