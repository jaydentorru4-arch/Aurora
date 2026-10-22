import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ClosingCtaProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExploreGreeting: () => void;
  onComeSayHi?: () => void;
}

export const ClosingCta: React.FC<ClosingCtaProps> = ({ onOpenAuth, onExploreGreeting, onComeSayHi }) => {
  return (
    <section className="py-24 relative overflow-hidden text-center">
      {/* Background illumination */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(135deg, #0B00CF, #C10823)'
        }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Okay, enough about me.
        </h2>
        
        <p className="text-base sm:text-lg text-[#94A3B8] mb-8 max-w-lg mx-auto">
          Come say hi already. I'm getting bored over here.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onComeSayHi || onExploreGreeting}
            className="btn-aurora-gradient w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-white shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Meet Aurora</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            onClick={() => onOpenAuth('login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold text-[#CBD5E1] hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            Log in
          </button>
        </div>
      </div>
    </section>
  );
};
