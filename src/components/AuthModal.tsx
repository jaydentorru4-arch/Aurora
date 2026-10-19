import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { ASSETS } from '../assets';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onOpenDashboard?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onOpenDashboard,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState(ASSETS.logo);

  // Sync mode with prop when opened
  React.useEffect(() => {
    setMode(initialMode);
    setSubmitted(false);
    setError(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-sm bg-[#080B1B] border border-white/10 rounded-2xl shadow-2xl p-5 sm:p-6 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 rounded-full blur-[80px] pointer-events-none opacity-40"
          style={{ background: mode === 'signup' ? '#C10823' : '#0B00CF' }}
          aria-hidden="true"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 text-[#94A3B8] hover:text-white transition-colors cursor-pointer p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Confirmation / Early Access Placeholder */
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {mode === 'signup' ? "You're on Aurora's Early Access List!" : "Account Verification Noted"}
            </h3>
            <p className="text-sm text-[#94A3B8] leading-relaxed mb-6">
              Full backend authentication via <strong className="text-white">Supabase Auth</strong> is scheduled for Phase 2. Your email <span className="text-[#FF2D2B] font-medium">{email}</span> has been logged for initial access.
            </p>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-[#CBD5E1] text-left mb-6 font-mono">
              <span className="text-[#94A3B8] block text-[10px] uppercase tracking-wider mb-1">Architecture note:</span>
              Auth endpoints will hook directly into Supabase JWT sessions & OAuth providers.
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5">
              {onOpenDashboard && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenDashboard();
                  }}
                  className="btn-aurora-gradient flex-1 py-3 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  Enter AI Dashboard
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-3 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
              >
                Back to Aurora
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header & Tabs */}
            <div className="text-center mb-4">
              <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center">
                <img
                  src={logoSrc}
                  onError={() => {
                    if (logoSrc !== ASSETS.logoFallback) {
                      setLogoSrc(ASSETS.logoFallback);
                    }
                  }}
                  alt="Aurora Logo"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(11,0,207,0.7)]"
                />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {mode === 'signup' ? 'Create Your Account' : 'Welcome Back'}
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                {mode === 'signup'
                  ? 'Save your personalized conversation memory.'
                  : 'Log in to continue your conversations with Aurora.'}
              </p>
            </div>

            {/* Mode Toggle Switch */}
            <div className="grid grid-cols-2 p-1 bg-white/[0.04] rounded-xl border border-white/5 mb-4">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-[#0B00CF] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-[#300A6E] to-[#C10823] text-white shadow-md'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                    What should Aurora call you?
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Kai or Ren"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-[#050713] border border-white/10 rounded-xl text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] focus:ring-1 focus:ring-[#0B00CF] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050713] border border-white/10 rounded-xl text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] focus:ring-1 focus:ring-[#0B00CF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#050713] border border-white/10 rounded-xl text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] focus:ring-1 focus:ring-[#0B00CF] transition-colors"
                  />
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-aurora-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-1.5 group cursor-pointer mt-2"
              >
                <span>{mode === 'signup' ? 'Create Account' : 'Log In'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
