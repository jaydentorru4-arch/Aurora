import React from 'react';
import { ASSETS } from '../assets';

export const PersonalitySection: React.FC = () => {
  const [portraitSrc, setPortraitSrc] = React.useState(ASSETS.heroBg);

  return (
    <section id="about" className="py-24 relative overflow-hidden bg-[#060715]">
      {/* Deep Violet Glow Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(48, 10, 110, 0.35) 0%, rgba(5, 7, 20, 0) 100%)'
        }}
        aria-hidden="true"
      />

      {/* Decorative subtle border line top & bottom */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#0B00CF]/30 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C10823]/30 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="aurora-surface rounded-3xl p-8 sm:p-12 md:p-14 border border-white/10 shadow-[0_20px_50px_rgba(48,10,110,0.25)] relative overflow-hidden">
          
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            
            {/* Small Character Expression Crop */}
            <div className="shrink-0 relative">
              {/* Dual ambient ring */}
              <div
                className="absolute -inset-2 rounded-2xl blur-md opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #0B00CF, #FF2D2B)'
                }}
                aria-hidden="true"
              />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border border-white/20 bg-[#070914] shadow-inner">
                <img
                  src={portraitSrc}
                  onError={() => {
                    if (portraitSrc !== ASSETS.heroBgFallback) {
                      setPortraitSrc(ASSETS.heroBgFallback);
                    }
                  }}
                  alt="Aurora's expressive teasing smile"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-[68%_25%] transform scale-135"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#04060F]/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Personality Text Content */}
            <div className="flex-1 text-left">
              {/* Heading */}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-5">
                One tiny warning, though.
              </h2>

              {/* Body Copy */}
              <div className="space-y-3.5 text-sm sm:text-base text-[#CBD5E1] leading-relaxed">
                <p>
                  I'm playful. I'm curious. I might tease you a little when you're being dramatic.
                </p>
                <p>
                  But when things get serious, I know how to listen.
                </p>
                <p>
                  You don't need to impress me, have the perfect question, or pretend you're okay when you're not.
                </p>
                <p className="text-white font-medium">
                  Just show up as yourself.
                </p>
                <p className="text-[#94A3B8] italic pt-1 text-xs sm:text-sm">
                  ...And maybe stop pretending your favourite anime character isn't overrated. We need to talk about that.
                </p>
              </div>

              {/* Sign-off */}
              <div className="mt-6 flex items-center justify-start">
                <span className="font-handwriting text-3xl sm:text-4xl text-[#FF2D2B] font-bold tracking-wide">
                  — Aurora ♡
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
