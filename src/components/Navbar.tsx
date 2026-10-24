import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ASSETS } from '../assets';
import { UserProfile } from '../types/auth';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onOpenDashboard?: () => void;
  onOpenChatbot?: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenDashboard,
  onOpenChatbot,
  currentUser,
  onLogout,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(ASSETS.logo);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-[#04060F]/90 backdrop-blur-md border-b border-white/5 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Brand Zone */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 group whitespace-nowrap shrink-0 text-decoration-none"
        >
          {/* Custom Aurora Logo */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            <img
              src={logoSrc}
              onError={() => {
                if (logoSrc !== ASSETS.logoFallback) {
                  setLogoSrc(ASSETS.logoFallback);
                }
              }}
              alt="Aurora Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(11,0,207,0.6)]"
            />
          </div>

          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-white">
              AURORA
            </span>
            <span className="text-[10px] font-medium tracking-widest text-[#94A3B8] -mt-1 hidden sm:block">
              YOUR AI SENPAI
            </span>
          </div>
        </a>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
          <button
            onClick={() => scrollTo('features')}
            className="hover:text-white transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="hover:text-white transition-colors duration-200 cursor-pointer whitespace-nowrap"
          >
            About Aurora
          </button>
        </nav>

        {/* Far Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-white flex items-center gap-2">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-4 h-4 rounded-full" />
                ) : null}
                <span>{currentUser.name}</span>
              </span>
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-2.5 py-1 text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
                >
                  Log out
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer flex items-center gap-2 shadow-sm active:scale-98"
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
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {!currentUser && (
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-white/10 border border-white/20 rounded-lg flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
              <span>Google</span>
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070A18] border-b border-white/10 px-6 py-5 mt-2 space-y-4">
          {onOpenChatbot && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenChatbot();
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-white rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Chat with Aurora</span>
            </button>
          )}
          <button
            onClick={() => scrollTo('features')}
            className="block w-full text-left py-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="block w-full text-left py-2 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
          >
            About Aurora
          </button>
          <div className="pt-2 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('login');
              }}
              className="w-full py-2.5 text-center text-xs font-semibold text-white rounded-lg border border-white/15 hover:bg-white/5 transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuth('signup');
              }}
              className="btn-aurora-gradient w-full py-2.5 text-center text-xs font-semibold text-white rounded-lg"
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
