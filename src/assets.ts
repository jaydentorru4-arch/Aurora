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
  logo: auroraLogo,
  logoFallback: '/images/aurora-logo.png',
  heroBg: heroBg,
  heroBgFallback: '/images/neon-overlook.png',
  portrait: heroPortrait,
  portraitFallback: '/images/aurora-portrait.jpg',
  expressions: {
    annoyed: annoyedImg,
    excited: excitedImg,
    exhausted: exhaustedImg,
    grumpy: grumpyImg,
    happy: happyImg,
    pouty: poutyImg,
    sad: sadImg,
    serious: seriousImg,
    suprised: suprisedImg,
  },
  expressionFallbacks: {
    annoyed: '/images/annoyed.png',
    excited: '/images/excited.png',
    exhausted: '/images/exhausted.png',
    grumpy: '/images/grumpy.png',
    happy: '/images/happy.png',
    pouty: '/images/pouty.png',
    sad: '/images/sad.png',
    serious: '/images/serious.png',
    suprised: '/images/suprised.png',
  }
};
