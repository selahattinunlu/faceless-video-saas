'use client';

import React from 'react';
import { AbsoluteFill, Audio, interpolate, useCurrentFrame } from 'remotion';
import { AnimatedImage } from './AnimatedImage';
import { AnimatedCaption } from './AnimatedCaption';
import { CaptionStyleId, CaptionPosition, GeneratedScene, ImageEffectId } from '@/types';

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
  const effect: ImageEffectId = scene.effect || 'kenburns';

  // Fade in/out for the whole scene
  const opacity = interpolate(
    frame,
    [0, 15, durationInFrames - 15, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ opacity }}>
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
