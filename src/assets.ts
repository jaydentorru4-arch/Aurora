import auroraLogo from './assets/images/aurora-logo.png';
import heroBg from './assets/images/neon-overlook.png';
import heroPortrait from './assets/images/aurora-portrait.jpg';

import annoyedImg from './assets/images/annoyed.png';
import excitedImg from './assets/images/excited.png';
import exhaustedImg from './assets/images/exhausted.png';
import grumpyImg from './assets/images/grumpy.png';
import happyImg from './assets/images/happy.png';
import poutyImg from './assets/images/pouty.png';
import sadImg from './assets/images/sad.png';
import seriousImg from './assets/images/serious.png';
import suprisedImg from './assets/images/suprised.png';

export const ASSETS = {
  logo: '/images/aurora-logo-avatar.webp',
  logoFallback: auroraLogo,
  heroBg: heroBg,
  heroBgFallback: '/images/neon-overlook.png',
  portrait: heroPortrait,
  portraitFallback: '/images/aurora-portrait.jpg',
  // Ultra-fast lightweight webp avatars (< 15KB each for instant dashboard load)
  dashboardAvatar: '/images/happy-avatar.webp',
  dashboardAvatarFallback: '/images/happy-avatar.png',
  expressions: {
    annoyed: '/images/annoyed-avatar.webp',
    excited: '/images/excited-avatar.webp',
    exhausted: '/images/exhausted-avatar.webp',
    grumpy: '/images/grumpy-avatar.webp',
    happy: '/images/happy-avatar.webp',
    pouty: '/images/pouty-avatar.webp',
    sad: '/images/sad-avatar.webp',
    serious: '/images/serious-avatar.webp',
    suprised: '/images/suprised-avatar.webp',
  },
  expressionFallbacks: {
    annoyed: annoyedImg,
    excited: excitedImg,
    exhausted: exhaustedImg,
    grumpy: grumpyImg,
    happy: happyImg,
    pouty: poutyImg,
    sad: sadImg,
    serious: seriousImg,
    suprised: suprisedImg,
  }
};
