import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ASSETS } from '../assets';
import { UserProfile } from '../types/auth';
import { loginWithGoogle } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [logoSrc, setLogoSrc] = useState(ASSETS.logo);

  useEffect(() => {
    setError(null);
    setLoading(false);
    setAuthenticatedUser(null);
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      setAuthenticatedUser(user);
      onLoginSuccess?.(user);
    } catch (err: unknown) {
      console.warn('Google sign-in error:', err);
      const code = (err as any)?.code;
      if (code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completion. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site.');
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to sign in with Google.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className="relative w-full max-w-md bg-[#070A1E]/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.1)] p-6 sm:p-8 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Glows */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full blur-[90px] opacity-35"
          style={{ background: 'radial-gradient(circle, #0B00CF 0%, #FF2D2B 100%)' }}
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 p-1.5 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {authenticatedUser ? (
          <div className="text-center py-4 space-y-4 animate-fade-in">
            <div className="relative w-16 h-16 rounded-2xl mx-auto overflow-hidden border-2 border-emerald-400/40 bg-[#0E1335] shadow-lg flex items-center justify-center">
              {authenticatedUser.avatar ? (
                <img
                  src={authenticatedUser.avatar}
                  alt={authenticatedUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#0B00CF] to-[#FF2D2B] flex items-center justify-center text-white font-bold text-xl">
                  {authenticatedUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0E1335]" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Google Authentication Verified</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Welcome, {authenticatedUser.name}!
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Connected with <span className="text-white font-medium">{authenticatedUser.email}</span>. Your Aurora workspace and conversations are now synced with Firebase.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn-aurora-gradient w-full py-3 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continue to Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Brand */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-[#0F1436] border border-[#FF2D2B]/30 flex items-center justify-center p-2 shadow-lg">
                <img
                  src={logoSrc}
                  onError={() => {
                    if (logoSrc !== ASSETS.logoFallback) {
                      setLogoSrc(ASSETS.logoFallback);
                    }
                  }}
                  alt="Aurora Logo"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(255,45,43,0.5)]"
                />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {initialMode === 'signup' ? 'Join Aurora' : 'Sign In to Aurora'}
                </h3>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed max-w-xs mx-auto">
                  {initialMode === 'signup'
                    ? 'Create your personal workspace and sync your conversation memory.'
                    : 'Access your saved conversations, neural persona, and research tools.'}
                </p>
              </div>
            </div>

            {/* Google Sign-In Action Card */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_35px_rgba(255,255,255,0.2)] active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed group border border-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 text-slate-700 animate-spin" />
                    <span>Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google 'G' Icon */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 leading-relaxed animate-fade-in">
                  {error}
                </div>
              )}
            </div>

            {/* Security Guarantee Note */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-[#64748B]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign in is strictly managed via Google OAuth. Zero passwords stored.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
