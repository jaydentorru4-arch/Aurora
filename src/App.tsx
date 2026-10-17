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

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [greetingModalOpen, setGreetingModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicItem | null>(null);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'contact' | null>(null);

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

  return (
    <div className="min-h-screen bg-[#04060F] text-[#F8FAFC] selection:bg-[#0B00CF] selection:text-white relative">
      {/* Global Subtle Grid Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      {/* Top Navigation */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Content Flow */}
      <main>
        {/* Section B: Hero */}
        <Hero
          onOpenAuth={handleOpenAuth}
          onExploreGreeting={() => setGreetingModalOpen(true)}
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
        />
      </main>

      {/* Minimal Footer */}
      <Footer onOpenLegal={(type) => setLegalModalType(type)} />

      {/* Modals & Dialogs */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />

      <GreetingModal
        isOpen={greetingModalOpen}
        onClose={() => setGreetingModalOpen(false)}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
        onScrollToTopics={handleScrollToTopics}
      />

      <TopicDetailModal
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onOpenAuth={(mode) => handleOpenAuth(mode)}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}
