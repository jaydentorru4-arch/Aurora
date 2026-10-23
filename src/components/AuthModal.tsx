import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { ASSETS } from '../assets';
import { UserProfile } from '../types/auth';
import { loginUser, registerUser } from '../services/authService';

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
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [logoSrc, setLogoSrc] = useState(ASSETS.logo);

  // Sync mode with prop when opened
  useEffect(() => {
    setMode(initialMode);
    setError(null);
    setLoading(false);
    setAuthenticatedUser(null);
    setShowPassword(false);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      let authResult;
      if (mode === 'signup') {
        authResult = await registerUser(cleanEmail, password, name.trim() || undefined);
      } else {
        authResult = await loginUser(cleanEmail, password);
      }

      setAuthenticatedUser(authResult.user);
      onLoginSuccess?.(authResult.user);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setError(null);
    setEmail('guest@aurora.ai');
    setPassword('aurora123');
    setMode('login');
    setLoading(true);
    try {
      // Try login or register guest account
      let authResult;
      try {
        authResult = await loginUser('guest@aurora.ai', 'aurora123');
      } catch {
        authResult = await registerUser('guest@aurora.ai', 'aurora123', 'Guest Explorer');
      }
      setAuthenticatedUser(authResult.user);
      onLoginSuccess?.(authResult.user);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize demo session.');
    } finally {
      setLoading(false);
    }
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

        {authenticatedUser ? (
          <div className="text-center py-5 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Welcome, {authenticatedUser.name}!
              </h3>
              <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                Logged in as <span className="text-white font-medium">{authenticatedUser.email}</span>. Your personalized workspace & chat history are active.
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-aurora-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer shadow-md"
            >
              Continue to Aurora
            </button>
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
                {mode === 'signup' ? 'Create Your Account' : 'Log In to Aurora'}
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                {mode === 'signup'
                  ? 'Sign up to keep your personal conversations isolated and saved.'
                  : 'Enter your credentials to access your session.'}
              </p>
            </div>

            {/* Quick Guest Sign-In */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleDemoSignIn}
                disabled={loading}
                className="w-full px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[#CBD5E1] text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-[#60A5FA]" />
                <span>Try Demo Guest Account (Instant)</span>
              </button>
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                    Your Name or Nickname
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Kai or Sarah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#050713] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#050713] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1 flex items-center justify-between">
                  <span>Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#60A5FA] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Hide password' : 'View password'}</span>
                  </button>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 bg-[#050713] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'View password'}
                    title={showPassword ? 'Hide password' : 'View password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors cursor-pointer p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-aurora-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white shadow-md flex items-center justify-center gap-1.5 group cursor-pointer mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account' : 'Log In'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
