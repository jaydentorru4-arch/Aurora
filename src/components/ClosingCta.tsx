import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UserProfile } from '../types/auth';

interface ClosingCtaProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onExploreGreeting: () => void;
  onComeSayHi?: () => void;
  currentUser?: UserProfile | null;
  onOpenDashboard?: () => void;
}

export const ClosingCta: React.FC<ClosingCtaProps> = ({
  onOpenAuth,
  onExploreGreeting,
  onComeSayHi,
  currentUser,
  onOpenDashboard,
}) => {
  const handleMeetAurora = () => {
    if (currentUser) {
      if (onComeSayHi) onComeSayHi();
      else if (onExploreGreeting) onExploreGreeting();
      else if (onOpenDashboard) onOpenDashboard();
    } else {
      // Require sign in with Google first before anything
      onOpenAuth('login');
    }
  };

  return (
    <section className="py-24 relative overflow-hidden text-center">
      {/* Background illumination */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(135deg, #0B00CF, #C10823)',
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
            type="button"
            onClick={handleMeetAurora}
            className="btn-aurora-gradient w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-semibold text-white shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Meet Aurora</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          {!currentUser ? (
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          ) : (
            <button
              type="button"
              onClick={onOpenDashboard}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold text-[#CBD5E1] hover:text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer"
            >
              Open Workspace
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
