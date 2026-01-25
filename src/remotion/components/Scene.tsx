'use client';

import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedImage } from './AnimatedImage';
import { AnimatedCaption } from './AnimatedCaption';
import { CaptionStyleId, CaptionPosition, GeneratedScene, ImageEffectId, DEFAULT_TRANSITION } from '@/types';
import { getEnterTransitionStyle, getExitTransitionStyle, durationMsToFrames } from '../effects/transitions';

interface SceneProps {
  scene: GeneratedScene;
  captionStyle: CaptionStyleId;
  captionPosition: CaptionPosition;
  durationInFrames: number;
}

export const Scene: React.FC<SceneProps> = ({
  scene,
  captionStyle,
  captionPosition,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const effect: ImageEffectId = scene.effect || 'kenburns';

  // Get transition settings with defaults
  const enterTransition = scene.enterTransition || DEFAULT_TRANSITION;
  const exitTransition = scene.exitTransition || DEFAULT_TRANSITION;

  // Convert durations to frames
  const enterDurationFrames = durationMsToFrames(enterTransition.durationMs, fps);
  const exitDurationFrames = durationMsToFrames(exitTransition.durationMs, fps);

  // Calculate transition progress
  const enterProgress = Math.min(1, frame / enterDurationFrames);
  const exitStartFrame = durationInFrames - exitDurationFrames;
  const exitProgress = frame >= exitStartFrame
    ? Math.min(1, (frame - exitStartFrame) / exitDurationFrames)
    : 0;

  // Get transition styles
  const enterStyle = useMemo(
    () => getEnterTransitionStyle(enterTransition.type, enterProgress),
    [enterTransition.type, enterProgress]
  );

  const exitStyle = useMemo(
    () => getExitTransitionStyle(exitTransition.type, exitProgress),
    [exitTransition.type, exitProgress]
  );

  // Combine enter and exit styles
  const combinedStyle = useMemo(() => {
    // During enter transition
    if (frame < enterDurationFrames) {
      return {
        opacity: enterStyle.opacity,
        transform: enterStyle.transform,
        filter: enterStyle.filter,
      };
    }

    // During exit transition
    if (frame >= exitStartFrame) {
      return {
        opacity: exitStyle.opacity,
        transform: exitStyle.transform,
        filter: exitStyle.filter,
      };
    }

    // In between - fully visible
    return {
      opacity: 1,
      transform: 'none',
      filter: undefined,
    };
  }, [frame, enterDurationFrames, exitStartFrame, enterStyle, exitStyle]);

  return (
    <AbsoluteFill style={combinedStyle}>
      {scene.imageUrl && (
        <AnimatedImage
          src={scene.imageUrl}
          effect={effect}
          durationInFrames={durationInFrames}
        />
      )}
      <AnimatedCaption
        text={scene.narration}
        styleId={captionStyle}
        position={captionPosition}
        durationInFrames={durationInFrames}
      />
      {scene.audioUrl && <Audio src={scene.audioUrl} />}
    </AbsoluteFill>
  );
};
