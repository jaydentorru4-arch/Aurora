import React, { useState } from 'react';
import { Tv, Shirt, Cpu, Compass, ArrowUpRight } from 'lucide-react';

export interface TopicItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
  senpaiQuote: string;
  sampleQuestion: string;
}

export const TOPICS: TopicItem[] = [
  {
    id: 'anime',
    tag: 'TOPIC 01',
    title: 'ANIME & MANGA',
    description: 'Favourite characters, wild theories, plot twists, and the latest releases. Yes, I have opinions.',
    icon: Tv,
    senpaiQuote: "If your top three anime doesn't cause at least one passionate heated debate, we need to completely overhaul your watchlist.",
    sampleQuestion: "Ask about: Winter season sleeper hits, ranking villain redemption arcs, or why Studio Trigger animation hits different."
  },
  {
    id: 'fashion',
    tag: 'TOPIC 02',
    title: 'FASHION & STYLE',
    description: "Outfit ideas, streetwear, aesthetics, and style advice. Let me see what you're working with.",
    icon: Shirt,
    senpaiQuote: "Oversized silhouette with minimalist tech accents is always top-tier. But let's check your sneaker pairing first.",
    sampleQuestion: "Ask about: Tokyo streetwear essentials, mixing dark palettes with neon pops, or thrift-flipping oversized fits."
  },
  {
    id: 'tech',
    tag: 'TOPIC 03',
    title: 'TECH & GADGETS',
    description: "Phones, gaming, coding, AI, and the tech everyone's talking about.",
    icon: Cpu,
    senpaiQuote: "I literally run on silicon and transformer models, so yeah—ask me about clean code or why your GPU is crying.",
    sampleQuestion: "Ask about: Custom mechanical keyboards, next-gen handheld gaming, or demystifying neural network weights."
  },
  {
    id: 'life',
    tag: 'TOPIC 04',
    title: 'REAL LIFE',
    description: 'School, friendships, everyday chaos, big questions, or absolutely nothing in particular.',
    icon: Compass,
    senpaiQuote: "Life gets messy and people are confusing. When you need to vent or talk through things with zero judgment, senpai is here.",
    sampleQuestion: "Ask about: Dealing with burnt-out study sessions, social batteries at zero, or late-night philosophical dilemmas."
  }
];

interface TopicsSectionProps {
  onSelectTopic: (topic: TopicItem) => void;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ onSelectTopic }) => {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background radial accent */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-10"
        style={{ background: '#300A6E' }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF2D2B]">
              CONVERSATION LANDSCAPES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            So... what's on your mind?
          </h2>
          <p className="text-base sm:text-lg text-[#94A3B8]">
            Pick a topic. Or don't. I'm not your teacher.
          </p>
        </div>

        {/* 4 Topic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="aurora-surface rounded-2xl p-7 text-left group cursor-pointer relative overflow-hidden"
              >
                {/* Top Row: Icon & Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-[#080B1C] border border-white/10 flex items-center justify-center text-white group-hover:text-[#FF2D2B] group-hover:border-[#0B00CF]/40 transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-[#94A3B8] group-hover:text-white transition-colors duration-200">
                    <span className="text-[11px] font-mono tracking-wider text-white/50">{topic.tag}</span>
                    <ArrowUpRight className="w-4 h-4 text-[#94A3B8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-white tracking-wide mb-2.5 flex items-center gap-2">
                  <span>{topic.title}</span>
                </h3>

                {/* Description */}
                <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
                  {topic.description}
                </p>

                {/* Sneak peek pill-less indicator */}
                <div className="text-xs text-[#FF2D2B]/90 font-medium flex items-center gap-1.5 pt-2 border-t border-white/5">
                  <span className="text-xs">Preview Senpai's take</span>
                  <span className="text-xs">→</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Subtle Note Below Section */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto font-medium">
            And yes, I can talk about plenty of other things. Don't limit yourself to my interests.
          </p>
        </div>
      </div>
    </section>
  );
};
