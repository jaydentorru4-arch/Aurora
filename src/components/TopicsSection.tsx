import React from 'react';
import { Tv, Shirt, Cpu, Compass, Check, ArrowRight } from 'lucide-react';

export interface TopicItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
  senpaiQuote: string;
  sampleQuestion: string;
  bgImage: string;
  price: string;
  period: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}

export const TOPICS: TopicItem[] = [
  {
    id: 'anime',
    tag: 'PLAN 01',
    badge: 'SENPAI FAVORITE',
    isPopular: true,
    title: 'ANIME & MANGA',
    price: '$0',
    period: '/ open access',
    description: 'Deep dives, wild theories, and heated debates over seasonal masterclasses and classic arcs.',
    icon: Tv,
    bgImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Seasonal sleeper hits & classic recs',
      'Villain redemption & arc analysis',
      'Unfiltered top-3 watchlist overhaul',
      'Studio Trigger animation debates'
    ],
    senpaiQuote: "If your top three anime doesn't cause at least one passionate heated debate, we need to completely overhaul your watchlist.",
    sampleQuestion: "Ask about: Winter season sleeper hits, ranking villain redemption arcs, or why Studio Trigger animation hits different."
  },
  {
    id: 'fashion',
    tag: 'PLAN 02',
    badge: 'TRENDING',
    isPopular: false,
    title: 'FASHION & STYLE',
    price: '$0',
    period: '/ open access',
    description: 'Tokyo techwear, aesthetic silhouettes, sneaker pairings, and unfiltered fit critiques.',
    icon: Shirt,
    bgImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Harajuku & techwear silhouettes',
      'Sneaker matching & accessory checks',
      'Honest fit audits with zero sugarcoating',
      'Palette coordination & thrift flips'
    ],
    senpaiQuote: "Oversized silhouette with minimalist tech accents is always top-tier. But let's check your sneaker pairing first.",
    sampleQuestion: "Ask about: Tokyo streetwear essentials, mixing dark palettes with neon pops, or thrift-flipping oversized fits."
  },
  {
    id: 'tech',
    tag: 'PLAN 03',
    badge: 'POWER USER',
    isPopular: false,
    title: 'TECH & GADGETS',
    price: '$0',
    period: '/ open access',
    description: 'Custom mechanical keyboards, handheld gaming hardware, AI models, and coding debates.',
    icon: Cpu,
    bgImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Custom switch lubing & keyboard builds',
      'Handheld rigs & GPU benchmarks',
      'Transformer models & code architecture',
      'Future tech & silicon teardowns'
    ],
    senpaiQuote: "I literally run on silicon and transformer models, so yeah—ask me about clean code or why your GPU is crying.",
    sampleQuestion: "Ask about: Custom mechanical keyboards, next-gen handheld gaming, or demystifying neural network weights."
  },
  {
    id: 'life',
    tag: 'PLAN 04',
    badge: 'CONFIDENTIAL',
    isPopular: false,
    title: 'REAL LIFE',
    price: '$0',
    period: '/ open access',
    description: 'Burnout resets, late-night philosophical dilemmas, everyday chaos, and unvarnished advice.',
    icon: Compass,
    bgImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80',
    features: [
      'Zero-judgment, safe confidential venting',
      'Social battery & study burnout resets',
      'Late-night philosophical debates',
      'Real honest talk with senpai warmth'
    ],
    senpaiQuote: "Life gets messy and people are confusing. When you need to vent or talk through things with zero judgment, senpai is here.",
    sampleQuestion: "Ask about: Dealing with burnt-out study sessions, social batteries at zero, or late-night philosophical dilemmas."
  }
];

interface TopicsSectionProps {
  onSelectTopic: (topic: TopicItem) => void;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ onSelectTopic }) => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#04060F]">
      {/* Background ambient radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[180px] pointer-events-none opacity-15"
        style={{ background: 'radial-gradient(circle, #0B00CF 0%, #300A6E 50%, #C10823 100%)' }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header styled with pricing plan clarity */}
        <div className="max-w-3xl mb-8 sm:mb-10 text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15] mb-2.5 text-balance">
            So... what's on your mind?
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed max-w-2xl">
            Choose your conversation plan. All lounges are open and unrestricted for early-access members. Pick a topic, dive into the details, and see how Aurora responds.
          </p>
        </div>

        {/* 4 Topic Pricing Plan Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8 items-stretch">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className={`group relative rounded-xl p-4 sm:p-5 text-left cursor-pointer overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  topic.isPopular
                    ? 'border border-[#FF2D2B]/70 shadow-[0_8px_25px_rgba(255,45,43,0.18)] hover:shadow-[0_12px_35px_rgba(255,45,43,0.25)] hover:border-[#FF2D2B]'
                    : 'border border-white/10 hover:border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_10px_25px_rgba(11,0,207,0.18)]'
                }`}
              >
                {/* Real-Life Stock Photography Background with Dark Glass Scrim */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                  <img
                    src={topic.bgImage}
                    alt={topic.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out opacity-20 group-hover:opacity-30"
                  />
                  {/* Multi-layered dark gradient overlay for crystal-clear readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060817] via-[#060817]/92 to-[#060817]/70" />
                </div>

                {/* Top Floating Badge for Popular Card */}
                {topic.badge && (
                  <div className="absolute top-3 right-3 z-20">
                    <span
                      className={`text-[8px] font-mono uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                        topic.isPopular
                          ? 'bg-[#FF2D2B] text-white shadow-[0_0_8px_#FF2D2B]'
                          : 'bg-white/10 text-[#CBD5E1] border border-white/10'
                      }`}
                    >
                      {topic.badge}
                    </span>
                  </div>
                )}

                {/* Card Content Top Zone */}
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* Plan Tag & Icon */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-white group-hover:text-[#FF2D2B] group-hover:border-[#FF2D2B]/40 transition-colors duration-200 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono tracking-widest text-[#94A3B8] uppercase block">
                        {topic.tag}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {topic.title}
                      </h3>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="my-2.5 pb-2.5 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {topic.price}
                      </span>
                      <span className="text-[11px] font-mono text-[#94A3B8]">
                        {topic.period}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="mb-4 flex-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-white/50 block mb-2">
                      Dialogue Features
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-[#CBD5E1]">
                      {topic.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-start gap-1.5 leading-snug">
                          <Check className="w-3 h-3 text-[#FF2D2B] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Bottom: Plan Action Button */}
                <div className="relative z-10 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTopic(topic);
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-[11px] font-bold tracking-wide flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                      topic.isPopular
                        ? 'btn-aurora-gradient text-white shadow-md shadow-[#0B00CF]/30 group-hover:shadow-[0_0_15px_rgba(255,45,43,0.35)]'
                        : 'bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{topic.isPopular ? 'Choose Plan' : 'Explore Plan'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footnote below cards */}
        <div className="text-center">
          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto font-medium">
            All conversation plans are 100% unlocked for early access preview users. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
};
