import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import { ImageEffectId } from '@/types';
import { getImageEffectStyle } from '../effects/image-effects';

interface AnimatedImageProps {
  src: string;
  effect: ImageEffectId;
  durationInFrames: number;
}

export const AnimatedImage: React.FC<AnimatedImageProps> = ({
  src,
  effect,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const style = getImageEffectStyle(effect, frame, durationInFrames, fps);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          ...style,
        }}
      />
    </AbsoluteFill>
  );
};
