import { TransitionType } from '@/types';
import { interpolate } from 'remotion';

interface TransitionStyle {
  opacity: number;
  transform: string;
  filter?: string;
}

/**
 * Get the CSS style for an enter transition at a given progress
 * @param type - The transition type
 * @param progress - Progress from 0 (start) to 1 (complete)
 * @returns CSS style object
 */
export function getEnterTransitionStyle(
  type: TransitionType,
  progress: number
): TransitionStyle {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  switch (type) {
    case 'none':
      return {
        opacity: 1,
        transform: 'none',
      };

    case 'fade':
      return {
        opacity: clampedProgress,
        transform: 'none',
      };

    case 'blur':
      const blurAmount = interpolate(clampedProgress, [0, 1], [20, 0]);
      return {
        opacity: clampedProgress,
        transform: 'none',
        filter: `blur(${blurAmount}px)`,
      };

    case 'slide-left':
      const slideLeftX = interpolate(clampedProgress, [0, 1], [100, 0]);
      return {
        opacity: clampedProgress,
        transform: `translateX(${slideLeftX}%)`,
      };

    case 'slide-right':
      const slideRightX = interpolate(clampedProgress, [0, 1], [-100, 0]);
      return {
        opacity: clampedProgress,
        transform: `translateX(${slideRightX}%)`,
      };

    case 'slide-up':
      const slideUpY = interpolate(clampedProgress, [0, 1], [100, 0]);
      return {
        opacity: clampedProgress,
        transform: `translateY(${slideUpY}%)`,
      };

    case 'slide-down':
      const slideDownY = interpolate(clampedProgress, [0, 1], [-100, 0]);
      return {
        opacity: clampedProgress,
        transform: `translateY(${slideDownY}%)`,
      };

    case 'zoom':
      const zoomScale = interpolate(clampedProgress, [0, 1], [0.5, 1]);
      return {
        opacity: clampedProgress,
        transform: `scale(${zoomScale})`,
      };

    default:
      return {
        opacity: 1,
        transform: 'none',
      };
  }
}

/**
 * Get the CSS style for an exit transition at a given progress
 * @param type - The transition type
 * @param progress - Progress from 0 (start) to 1 (complete)
 * @returns CSS style object
 */
export function getExitTransitionStyle(
  type: TransitionType,
  progress: number
): TransitionStyle {
  const clampedProgress = Math.max(0, Math.min(1, progress));

  switch (type) {
    case 'none':
      return {
        opacity: 1,
        transform: 'none',
      };

    case 'fade':
      return {
        opacity: 1 - clampedProgress,
        transform: 'none',
      };

    case 'blur':
      const blurAmount = interpolate(clampedProgress, [0, 1], [0, 20]);
      return {
        opacity: 1 - clampedProgress,
        transform: 'none',
        filter: `blur(${blurAmount}px)`,
      };

    case 'slide-left':
      const slideLeftX = interpolate(clampedProgress, [0, 1], [0, -100]);
      return {
        opacity: 1 - clampedProgress,
        transform: `translateX(${slideLeftX}%)`,
      };

    case 'slide-right':
      const slideRightX = interpolate(clampedProgress, [0, 1], [0, 100]);
      return {
        opacity: 1 - clampedProgress,
        transform: `translateX(${slideRightX}%)`,
      };

    case 'slide-up':
      const slideUpY = interpolate(clampedProgress, [0, 1], [0, -100]);
      return {
        opacity: 1 - clampedProgress,
        transform: `translateY(${slideUpY}%)`,
      };

    case 'slide-down':
      const slideDownY = interpolate(clampedProgress, [0, 1], [0, 100]);
      return {
        opacity: 1 - clampedProgress,
        transform: `translateY(${slideDownY}%)`,
      };

    case 'zoom':
      const zoomScale = interpolate(clampedProgress, [0, 1], [1, 1.5]);
      return {
        opacity: 1 - clampedProgress,
        transform: `scale(${zoomScale})`,
      };

    default:
      return {
        opacity: 1,
        transform: 'none',
      };
  }
}

/**
 * Convert duration in milliseconds to frames at 30fps
 */
export function durationMsToFrames(durationMs: number, fps: number = 30): number {
  return Math.round((durationMs / 1000) * fps);
}
