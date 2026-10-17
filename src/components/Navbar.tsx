import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { ASSETS } from '../assets';

interface NavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              src={ASSETS.logo}
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
          <button
            onClick={() => onOpenAuth('login')}
            className="px-4 py-2 text-xs font-semibold text-white/90 rounded-lg border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-200 whitespace-nowrap cursor-pointer"
          >
            Log in
          </button>
          <button
            onClick={() => onOpenAuth('signup')}
            className="btn-aurora-gradient px-4 py-2 text-xs font-semibold text-white rounded-lg whitespace-nowrap cursor-pointer shadow-md"
          >
            Sign up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onOpenAuth('signup')}
            className="btn-aurora-gradient px-3 py-1.5 text-xs font-semibold text-white rounded-md whitespace-nowrap"
          >
            Sign up
          </button>
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
