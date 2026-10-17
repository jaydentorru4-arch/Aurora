import React, { useState, useEffect, useRef } from 'react';
import { ASSETS } from '../assets';

interface ExpressionItem {
  id: string;
  label: string;
  dialogue: string;
  path: string;
  fallbackPath: string;
}

const EXPRESSIONS: ExpressionItem[] = [
  {
    id: 'exp-1',
    label: 'Happy',
    dialogue: 'Ehehe! You came to see me! ♡',
    path: ASSETS.expressions.happy,
    fallbackPath: '/images/happy.png'
  },
  {
    id: 'exp-2',
    label: 'Annoyed',
    dialogue: 'Hmph! What are you staring at?!',
    path: ASSETS.expressions.annoyed,
    fallbackPath: '/images/annoyed.png'
  },
  {
    id: 'exp-3',
    label: 'Surprised',
    dialogue: 'W-WAIT?! I wasn\'t ready for that!',
    path: ASSETS.expressions.suprised,
    fallbackPath: '/images/suprised.png'
  },
  {
    id: 'exp-4',
    label: 'Grumpy',
    dialogue: 'Ughhh… do you mind? I\'m brooding here.',
    path: ASSETS.expressions.grumpy,
    fallbackPath: '/images/grumpy.png'
  },
  {
    id: 'exp-5',
    label: 'Pouty',
    dialogue: 'It\'s not fair! You\'re supposed to spoil me!',
    path: ASSETS.expressions.pouty,
    fallbackPath: '/images/pouty.png'
  },
  {
    id: 'exp-6',
    label: 'Angry',
    dialogue: 'EXCUSE ME?! You did NOT just say that!',
    path: ASSETS.expressions.serious,
    fallbackPath: '/images/serious.png'
  },
  {
    id: 'exp-7',
    label: 'Grumpy',
    dialogue: '…I\'m not grumpy. You\'re just annoying.',
    path: ASSETS.expressions.exhausted,
    fallbackPath: '/images/exhausted.png'
  },
  {
    id: 'exp-8',
    label: 'Excited',
    dialogue: 'KYAAA!! THIS IS SO COOL!!',
    path: ASSETS.expressions.excited,
    fallbackPath: '/images/excited.png'
  },
  {
    id: 'exp-9',
    label: 'Sad',
    dialogue: 'Oh… I thought you\'d stay a little longer.',
    path: ASSETS.expressions.sad,
    fallbackPath: '/images/sad.png'
  }
];

interface CardProps {
  item: ExpressionItem;
  index: number;
  prefersReducedMotion: boolean;
}

const ExpressionCard: React.FC<CardProps> = ({ item, index, prefersReducedMotion }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageTiltStyle, setImageTiltStyle] = useState<React.CSSProperties>({});
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(item.path);

  // Scroll entrance trigger using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Subtle CSS-based 3D tilt applied directly to the character illustration container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate normalized -1 to 1 coordinates
    const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
    const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

    // Dynamic tilt angles (max ~8 degrees for elegant subtlety)
    const rotateX = normY * -8.5;
    const rotateY = normX * 8.5;

    setImageTiltStyle({
      transform: `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(26px) scale3d(1.045, 1.045, 1.045)`,
      transition: 'transform 0.08s ease-out'
    });

    setGlarePos({
      x: ((x / rect.width) * 100),
      y: ((y / rect.height) * 100),
      opacity: 0.18
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (prefersReducedMotion) return;
    setImageTiltStyle({
      transform: 'perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)',
      transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    });
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleImageError = () => {
    if (currentSrc === item.path) {
      setCurrentSrc(item.fallbackPath);
    } else {
      setImgError(true);
    }
  };

  // Alternating entrance animation parameters
  const isEven = index % 2 === 0;
  const initialTranslate = prefersReducedMotion
    ? 'none'
    : isVisible
    ? 'translate3d(0, 0, 0) scale(1)'
    : isEven
    ? 'translate3d(-18px, 24px, 0) scale(0.96)'
    : 'translate3d(18px, 24px, 0) scale(0.96)';

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsHovered((prev) => !prev)}
      style={{
        opacity: prefersReducedMotion ? 1 : isVisible ? 1 : 0,
        transform: prefersReducedMotion ? 'none' : initialTranslate,
        transition: prefersReducedMotion
          ? 'none'
          : `opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${index * 65}ms, transform 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${index * 65}ms`
      }}
      className="group relative flex flex-col items-center justify-between p-3 sm:p-4 pt-6 sm:pt-7 rounded-xl transition-all duration-300 cursor-default select-none"
    >
      {/* Cinematic Anime Speech Pop-up Bubble */}
      <div
        className={`absolute -top-1 sm:top-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 ease-out transform ${
          isHovered
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-1.5 scale-90'
        }`}
        aria-hidden={!isHovered}
      >
        <div className="relative px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#080B1E]/95 border border-[#FF2D2B]/45 shadow-[0_6px_20px_rgba(11,0,207,0.45)] backdrop-blur-md whitespace-nowrap max-w-[200px] sm:max-w-[240px]">
          {/* Subtle Aurora signature gradient accent on the dialogue border */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#0B00CF]/15 via-transparent to-[#FF2D2B]/15 pointer-events-none" />

          {/* Dialogue Text */}
          <p className="relative z-10 text-[10px] sm:text-[11px] font-semibold text-white tracking-wide text-center drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {item.dialogue}
          </p>

          {/* Speech-bubble pointer directed toward Aurora's head */}
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#080B1E] border-r border-b border-[#FF2D2B]/45 transform rotate-45"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Subtle dual-accent ambient backlight behind character */}
      <div
        className="absolute inset-2 rounded-full opacity-20 group-hover:opacity-50 blur-2xl transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            index % 3 === 0
              ? 'radial-gradient(circle, #0B00CF 0%, transparent 70%)'
              : index % 3 === 1
              ? 'radial-gradient(circle, #300A6E 0%, transparent 70%)'
              : 'radial-gradient(circle, #C10823 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      {/* Subtle aura ring on hover */}
      <div className="absolute inset-0 rounded-xl border border-white/[0.04] group-hover:border-white/10 group-hover:bg-white/[0.02] transition-all duration-300 pointer-events-none" />

      {/* Transparent Character Artwork Slot scaled down ~50% */}
      <div
        ref={imageContainerRef}
        style={prefersReducedMotion ? undefined : imageTiltStyle}
        className="relative w-full aspect-square max-w-[130px] sm:max-w-[155px] md:max-w-[175px] flex items-center justify-center overflow-visible mb-2 will-change-transform transform-gpu"
      >
        {!imgError ? (
          <img
            src={currentSrc}
            alt={`Aurora expressing: ${item.label}`}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-contain filter drop-shadow-[0_8px_18px_rgba(0,0,0,0.85)] group-hover:drop-shadow-[0_12px_28px_rgba(11,0,207,0.5)] transition-all duration-300 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Dynamic Specular Sheen across the artwork */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.22) 0%, rgba(11, 0, 207, 0.15) 35%, transparent 65%)`
          }}
          aria-hidden="true"
        />

        {/* Resilient Fallback Container */}
        {(!imgLoaded || imgError) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center rounded-lg bg-white/[0.02] border border-white/5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0B00CF]/30 to-[#C10823]/30 flex items-center justify-center mb-2">
              <span className="text-base font-bold text-white/70 font-mono">
                {item.label.charAt(0)}
              </span>
            </div>
            <span className="text-[10px] text-[#94A3B8] font-mono tracking-wider uppercase">
              {item.label}
            </span>
          </div>
        )}
      </div>

      {/* Exactly ONE short text label */}
      <div className="relative z-10 text-center pt-1">
        <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/90 group-hover:text-white transition-all duration-200">
          {item.label}
        </span>
      </div>
    </div>
  );
};

export const PersonalityExpressions: React.FC = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <section
      id="expressions"
      className="relative py-14 sm:py-20 overflow-hidden bg-[#04060F]"
      aria-label="Nine Expressions of Aurora"
    >
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-15"
        style={{
          background: 'radial-gradient(circle, #0B00CF 0%, #300A6E 50%, #C10823 100%)'
        }}
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mb-8 sm:mb-10 text-left">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-[1.15] mb-2.5 text-balance">
            Nine Expressions. One Aurora.
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed">
            Go on, get to know me. I've got a few sides to me. Some are adorable. Some are questionable. Don't worry about it.
          </p>
        </div>

        {/* 9 Expressions Grid: 3-column layout on wide screens, 3 or 2 on tablet, 2 on mobile for compact elegance */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {EXPRESSIONS.map((item, index) => (
            <ExpressionCard
              key={item.id}
              item={item}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
