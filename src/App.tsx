import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PersonalityExpressions } from './components/PersonalityExpressions';
import { TopicsSection, TopicItem } from './components/TopicsSection';
import { PersonalitySection } from './components/PersonalitySection';
import { ClosingCta } from './components/ClosingCta';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { TopicDetailModal } from './components/TopicDetailModal';
import { GreetingModal } from './components/GreetingModal';
import { LegalModal } from './components/LegalModals';
import { Dashboard } from './components/dashboard/Dashboard';
import { ChatbotWidget } from './components/ChatbotWidget';
import { UserProfile } from './types/auth';
import { onAuthProfileChanged, logoutUser } from './services/authService';

export default function App() {
  const getInitialView = (): 'home' | 'dashboard' => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (
        p === '/dashboard' ||
        p.startsWith('/dashboard') ||
        h === '#dashboard' ||
        h.startsWith('#/dashboard') ||
        h === '#chat'
      ) {
        return 'dashboard';
      }
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>(getInitialView);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [greetingModalOpen, setGreetingModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'contact' | null>(null);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatbotFullScreen, setChatbotFullScreen] = useState(false);
  const [chatbotInitialPrompt, setChatbotInitialPrompt] = useState<string | null>(null);

  const handleComeSayHi = () => {
    setChatbotFullScreen(true);
    setChatbotOpen(true);
  };

  // Reactive Firebase Auth User State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('aurora_current_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Listen to Firebase Google Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthProfileChanged((verifiedUser) => {
      setCurrentUser(verifiedUser);
    });
    return () => unsubscribe();
  }, []);

  // Sync with browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      const h = window.location.hash;
      if (
        p === '/dashboard' ||
        p.startsWith('/dashboard') ||
        h === '#dashboard' ||
        h.startsWith('#/dashboard') ||
        h === '#chat'
      ) {
        setCurrentView('dashboard');
      } else {
        setCurrentView('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = (view: 'home' | 'dashboard') => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      if (view === 'dashboard') {
        window.history.pushState({}, '', '/dashboard');
      } else {
        window.history.pushState({}, '', '/');
      }
    }
  };

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleScrollToTopics = () => {
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAuthModalOpen(false);
        setGreetingModalOpen(false);
        setSelectedTopic(null);
        setLegalModalType(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dedicated Dashboard View
  if (currentView === 'dashboard') {
    return (
      <>
        <Dashboard
          onBackToHome={() => navigateTo('home')}
          currentUser={currentUser}
          onLogout={() => {
            logoutUser();
            setCurrentUser(null);
            try {
              localStorage.removeItem('aurora_current_user');
            } catch {}
          }}
          onOpenAuth={handleOpenAuth}
        />

        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            try {
              localStorage.setItem('aurora_current_user', JSON.stringify(user));
            } catch {}
          }}
        />
      </>
    );
  }

  // Approved Existing Homepage
  return (
    <div className="min-h-screen bg-[#04060F] text-[#F8FAFC] selection:bg-[#0B00CF] selection:text-white relative">
      {/* Global Subtle Grid Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Top Navigation */}
      <Navbar
        onOpenAuth={handleOpenAuth}
        onOpenDashboard={() => navigateTo('dashboard')}
        onOpenChatbot={() => setChatbotOpen(true)}
        currentUser={currentUser}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
          try {
            localStorage.removeItem('aurora_current_user');
          } catch {}
        }}
      />

      {/* Main Content Flow */}
      <main>
        {/* Section B: Hero */}
        <Hero
          onOpenAuth={handleOpenAuth}
          onExploreGreeting={() => setGreetingModalOpen(true)}
          onComeSayHi={handleComeSayHi}
        />

        {/* Nine Expressions Section */}
        <PersonalityExpressions />

        {/* Section C: Conversation Topics */}
        <TopicsSection
          onSelectTopic={(topic) => setSelectedTopic(topic)}
        />

        {/* Section D: The Personality Moment */}
        <PersonalitySection />

        {/* Section E: Closing CTA */}
        <ClosingCta
          onOpenAuth={handleOpenAuth}
          onExploreGreeting={() => setGreetingModalOpen(true)}
          onComeSayHi={handleComeSayHi}
        />
      </main>

      {/* Minimal Footer */}
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

      {/* Modals & Dialogs */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          try {
            localStorage.setItem('aurora_current_user', JSON.stringify(user));
          } catch {}
        }}
      />

      <GreetingModal
        isOpen={greetingModalOpen}
        onClose={() => setGreetingModalOpen(false)}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onScrollToTopics={handleScrollToTopics}
        onOpenDashboard={() => navigateTo('dashboard')}
        onOpenChatbot={() => {
          setChatbotFullScreen(true);
          setChatbotOpen(true);
        }}
      />

      <TopicDetailModal
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onStartChat={(prompt) => {
          setSelectedTopic(null);
          setChatbotInitialPrompt(prompt);
          setChatbotOpen(true);
        }}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Floating Aurora AI Chatbot Widget (Supports Windowed & Full-Screen) */}
      <ChatbotWidget
        externalOpen={chatbotOpen}
        initialFullScreen={chatbotFullScreen}
        onCloseExternal={() => {
          setChatbotOpen(false);
          setChatbotFullScreen(false);
        }}
        onOpenDashboard={() => navigateTo('dashboard')}
        initialPrompt={chatbotInitialPrompt}
        onPromptConsumed={() => setChatbotInitialPrompt(null)}
      />
    </div>
  );
}
