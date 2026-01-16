import { CaptionStyleConfig, CaptionStyleId } from '@/types';

export const CAPTION_STYLES: Record<CaptionStyleId, CaptionStyleConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    supportsAnimation: false,
    textStyle: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 28,
      fontWeight: '500',
      color: '#ffffff',
    },
    backgroundStyle: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.6)',
      padding: 20,
      borderRadius: 0,
    },
  },

  bold: {
    id: 'bold',
    name: 'Bold',
    supportsAnimation: true,
    textStyle: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 32,
      fontWeight: '800',
      color: '#ffffff',
      highlightColor: '#facc15', // Yellow highlight for karaoke
      strokeColor: '#000000',
      strokeWidth: 4,
    },
    backgroundStyle: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.7)',
      padding: 24,
      borderRadius: 12,
    },
    animationStyle: {
      type: 'karaoke',
      wordTransition: 'instant',
      wordsPerChunk: 2,
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    supportsAnimation: false,
    textStyle: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 24,
      fontWeight: '400',
      color: '#ffffff',
      shadowColor: 'rgba(0, 0, 0, 0.8)',
      shadowBlur: 8,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
    },
    backgroundStyle: {
      enabled: false,
      color: 'transparent',
      padding: 0,
      borderRadius: 0,
    },
  },

  neon: {
    id: 'neon',
    name: 'Neon',
    supportsAnimation: true,
    textStyle: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 30,
      fontWeight: '700',
      color: '#ffffff',
      highlightColor: '#22d3ee', // Cyan highlight for karaoke
      shadowColor: '#06b6d4',
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
    },
    backgroundStyle: {
      enabled: false,
      color: 'transparent',
      padding: 0,
      borderRadius: 0,
    },
    animationStyle: {
      type: 'karaoke',
      wordTransition: 'smooth',
      wordsPerChunk: 2,
    },
  },
};

export function getCaptionStyle(id: CaptionStyleId): CaptionStyleConfig {
  return CAPTION_STYLES[id] || CAPTION_STYLES.classic;
}

export function getAllCaptionStyles(): CaptionStyleConfig[] {
  return Object.values(CAPTION_STYLES);
}
