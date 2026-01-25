import { interpolate, Easing } from 'remotion';
import { ImageEffectId } from '@/types';

export function getImageEffectStyle(
  effect: ImageEffectId,
  frame: number,
  durationInFrames: number,
  fps: number
): React.CSSProperties {
  switch (effect) {
    case 'kenburns': {
      const scale = interpolate(frame, [0, durationInFrames], [1, 1.15]);
      const translateX = interpolate(frame, [0, durationInFrames], [0, -20]);
      const translateY = interpolate(frame, [0, durationInFrames], [0, -10]);
      return {
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
      };
    }

    case 'zoom-in': {
      const scale = interpolate(frame, [0, durationInFrames], [1, 1.2], {
        easing: Easing.out(Easing.cubic),
      });
      return { transform: `scale(${scale})` };
    }

    case 'zoom-out': {
      const scale = interpolate(frame, [0, durationInFrames], [1.2, 1], {
        easing: Easing.out(Easing.cubic),
      });
      return { transform: `scale(${scale})` };
    }

    case 'pan-left': {
      const translateX = interpolate(frame, [0, durationInFrames], [30, -30]);
      return {
        transform: `scale(1.1) translateX(${translateX}px)`,
      };
    }

    case 'pan-right': {
      const translateX = interpolate(frame, [0, durationInFrames], [-30, 30]);
      return {
        transform: `scale(1.1) translateX(${translateX}px)`,
      };
    }

    case 'shake': {
      const shakeX = Math.sin(frame * 0.5) * 3;
      const shakeY = Math.cos(frame * 0.7) * 2;
      return {
        transform: `translate(${shakeX}px, ${shakeY}px)`,
      };
    }

    case 'pulse': {
      const scale = interpolate(Math.sin(frame * 0.1), [-1, 1], [1, 1.03]);
      return { transform: `scale(${scale})` };
    }

    case 'none':
    default:
      return {};
  }
}
