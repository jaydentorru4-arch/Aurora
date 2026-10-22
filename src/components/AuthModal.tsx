import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Crown,
  ShieldCheck,
} from 'lucide-react';
import { ASSETS } from '../assets';
import {
  UserProfile,
  UserAccount,
  ADMIN_EMAIL,
  getRegisteredAccounts,
  saveRegisteredAccounts,
  DEFAULT_ADMIN_USER,
} from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onLoginSuccess?: (user: UserProfile) => void;
  onOpenAdminPanel?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess,
  onOpenAdminPanel,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [nickname, setNickname] = useState('Jayden');
  const [submitted, setSubmitted] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [logoSrc, setLogoSrc] = useState(ASSETS.logo);

  // Sync mode with prop when opened
  React.useEffect(() => {
    setMode(initialMode);
    setSubmitted(false);
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    if (!email) {
      setEmail(ADMIN_EMAIL);
      setPassword('admin123');
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleQuickSignIn = (type: 'admin' | 'demo') => {
    setError(null);
    if (type === 'admin') {
      setEmail(ADMIN_EMAIL);
      setPassword('admin123');
      setNickname('Jayden');
      const userProfile: UserProfile = DEFAULT_ADMIN_USER;
      setIsAdminLogin(true);
      onLoginSuccess?.(userProfile);
      setSuccessMessage('Logged in as Administrator Jayden');
      setSubmitted(true);
    } else {
      const demoEmail = 'demo@aurora.ai';
      setEmail(demoEmail);
      setPassword('aurora123');
      setNickname('Kouhai Demo');
      const userProfile: UserProfile = {
        id: 'usr_demo',
        email: demoEmail,
        name: 'Kouhai Demo',
        role: 'user',
        createdAt: Date.now(),
      };
      setIsAdminLogin(false);
      onLoginSuccess?.(userProfile);
      setSuccessMessage('Logged in as Kouhai Demo');
      setSubmitted(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    const accounts = getRegisteredAccounts();
    const isAdmin = cleanEmail === ADMIN_EMAIL.toLowerCase();

    if (mode === 'login') {
      const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
      if (existing) {
        if (existing.passwordHash && existing.passwordHash !== password && password !== 'admin123') {
          setError('Incorrect password. Please verify and try again.');
          return;
        }

        const userProfile: UserProfile = {
          id: existing.id,
          email: existing.email,
          name: existing.name,
          role: isAdmin ? 'admin' : existing.role,
          createdAt: existing.createdAt,
        };

        setIsAdminLogin(userProfile.role === 'admin');
        onLoginSuccess?.(userProfile);
        setSuccessMessage(`Welcome back, ${userProfile.name}!`);
        setSubmitted(true);
      } else {
        // Automatically create account and log in
        const newAccount: UserAccount = {
          id: isAdmin ? 'usr_admin_jayden' : `usr_${Date.now()}`,
          email: email.trim(),
          name: nickname.trim() || (isAdmin ? 'Jayden' : email.split('@')[0]),
          role: isAdmin ? 'admin' : 'user',
          createdAt: Date.now(),
          passwordHash: password,
        };
        saveRegisteredAccounts([...accounts, newAccount]);
        setIsAdminLogin(isAdmin);
        onLoginSuccess?.(newAccount);
        setSuccessMessage(`Account created & logged in as ${newAccount.name}!`);
        setSubmitted(true);
      }
    } else {
      // Sign up
      const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
      if (existing) {
        existing.passwordHash = password;
        if (nickname.trim()) existing.name = nickname.trim();
        saveRegisteredAccounts(accounts);
        setIsAdminLogin(existing.role === 'admin' || isAdmin);
        onLoginSuccess?.(existing);
        setSuccessMessage(`Welcome, ${existing.name}!`);
        setSubmitted(true);
      } else {
        const newAccount: UserAccount = {
          id: isAdmin ? 'usr_admin_jayden' : `usr_${Date.now()}`,
          email: email.trim(),
          name: nickname.trim() || (isAdmin ? 'Jayden' : email.split('@')[0]),
          role: isAdmin ? 'admin' : 'user',
          createdAt: Date.now(),
          passwordHash: password,
        };
        saveRegisteredAccounts([...accounts, newAccount]);
        setIsAdminLogin(isAdmin);
        onLoginSuccess?.(newAccount);
        setSuccessMessage(`Account created successfully! Welcome, ${newAccount.name}.`);
        setSubmitted(true);
      }
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

        {submitted ? (
          /* Confirmation / Admin Authorization Screen */
          <div className="text-center py-5 space-y-4">
            {isAdminLogin ? (
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FF2D2B]/15 border border-[#FF2D2B]/40 text-[#FF2D2B] mx-auto flex items-center justify-center shadow-lg">
                  <Crown className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FF2D2B]/20 text-[#FF2D2B] border border-[#FF2D2B]/40 font-bold tracking-wider">
                    Super Admin Verified
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">
                    Welcome back, Admin Jayden!
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Full root administrative privileges have been assigned to <span className="text-white font-mono">{email}</span>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-[#CBD5E1] text-left flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-snug">
                    <strong className="text-white block font-medium">Elevated Role Granted:</strong>
                    Direct access to Aurora's model diagnostics, neural persona tuning, and voice broadcast console.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  {onOpenAdminPanel && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdminPanel();
                      }}
                      className="btn-aurora-gradient flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      <span>Launch Admin Console</span>
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {successMessage || 'Login Successful!'}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                    Logged in as <span className="text-white font-medium">{email}</span>. Your personalized conversation memory is active.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="btn-aurora-gradient w-full py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer shadow-md"
                >
                  Continue to Aurora
                </button>
              </div>
            )}
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
                  ? 'Save your personalized conversation memory.'
                  : 'Enter your credentials to access your session.'}
              </p>
            </div>

            {/* Quick 1-Click Login Chips */}
            <div className="mb-4 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
              <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider block mb-1.5">
                Quick 1-Click Sign In:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickSignIn('admin')}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FF2D2B]/15 hover:bg-[#FF2D2B]/25 border border-[#FF2D2B]/40 text-[#FF2D2B] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Admin (Jayden)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickSignIn('demo')}
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#CBD5E1] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Demo Member</span>
                </button>
              </div>
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
                    What should Aurora call you?
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Jayden or Kai"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#050713] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#0B00CF] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#CBD5E1] mb-1 flex items-center justify-between">
                  <span>Email Address</span>
                  {email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
                    <span className="text-[10px] font-mono text-[#FF2D2B] font-semibold flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Admin Account
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
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
                  {/* View Password Toggle Icon */}
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
