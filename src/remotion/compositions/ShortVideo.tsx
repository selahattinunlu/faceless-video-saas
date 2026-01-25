'use client';

import React, { useMemo } from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import { Scene } from '../components/Scene';
import { CaptionStyleId, CaptionPosition, GeneratedScene } from '@/types';

interface ShortVideoProps {
  scenes: GeneratedScene[];
  captionStyle: CaptionStyleId;
  captionPosition: CaptionPosition;
}

export const ShortVideo: React.FC<ShortVideoProps> = ({
  scenes,
  captionStyle,
  captionPosition,
}) => {
  const { fps } = useVideoConfig();

  const sceneFrames = useMemo(() => {
    let currentFrame = 0;
    return scenes.map((scene) => {
      const durationMs = scene.durationMs || 3000;
      const durationInFrames = Math.ceil((durationMs / 1000) * fps);
      const startFrame = currentFrame;
      currentFrame += durationInFrames;
      return { scene, startFrame, durationInFrames };
    });
  }, [scenes, fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {sceneFrames.map(({ scene, startFrame, durationInFrames }) => (
        <Sequence
          key={scene.id}
          from={startFrame}
          durationInFrames={durationInFrames}
        >
          <Scene
            scene={scene}
            captionStyle={captionStyle}
            captionPosition={captionPosition}
            durationInFrames={durationInFrames}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
