'use client';

import React, { useMemo } from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { CaptionStyleId, CaptionPosition } from '@/types';
import { getCaptionStyle } from '@/lib/caption-styles';
import { estimateWordTimings } from '@/lib/word-timing';

interface AnimatedCaptionProps {
  text: string;
  styleId: CaptionStyleId;
  position: CaptionPosition;
  durationInFrames: number;
}

export const AnimatedCaption: React.FC<AnimatedCaptionProps> = ({
  text,
  styleId,
  position,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const style = getCaptionStyle(styleId);

  const durationMs = (durationInFrames / fps) * 1000;
  const elapsedMs = (frame / fps) * 1000;

  const isAnimated = style.supportsAnimation;
  const wordsPerChunk = style.animationStyle?.wordsPerChunk || 2;

  // Word timings hesapla
  const wordTimings = useMemo(() => {
    return estimateWordTimings(text, durationMs);
  }, [text, durationMs]);

  // Fade in/out icin opacity
  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - 10, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Hangi kelime aktif
  const currentWordIndex = useMemo(() => {
    for (let i = wordTimings.length - 1; i >= 0; i--) {
      if (elapsedMs >= wordTimings[i].startTime) {
        return i;
      }
    }
    return 0;
  }, [wordTimings, elapsedMs]);

  const words = text.split(' ');

  // Chunk'lara bol
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk));
  }

  const currentChunkIndex = Math.floor(currentWordIndex / wordsPerChunk);
  const currentChunk = chunks[currentChunkIndex] || chunks[0] || [];
  const chunkStartIndex = currentChunkIndex * wordsPerChunk;

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    padding: '0 20px',
    opacity,
    ...(position === 'center'
      ? { top: '50%', transform: 'translateY(-50%)' }
      : { bottom: 100 }),
  };

  const textContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    padding: style.backgroundStyle.enabled ? style.backgroundStyle.padding : 0,
    backgroundColor: style.backgroundStyle.enabled
      ? style.backgroundStyle.color
      : 'transparent',
    borderRadius: style.backgroundStyle.borderRadius,
  };

  const getTextShadow = (isHighlighted: boolean) => {
    if (!style.textStyle.shadowColor) {
      return undefined;
    }
    const blur = style.textStyle.shadowBlur || 0;
    const color =
      isHighlighted && style.textStyle.highlightColor
        ? style.textStyle.highlightColor
        : style.textStyle.shadowColor;
    return `${style.textStyle.shadowOffsetX || 0}px ${style.textStyle.shadowOffsetY || 0}px ${blur}px ${color}`;
  };

  if (!isAnimated) {
    // Static caption
    return (
      <div style={containerStyle}>
        <div style={textContainerStyle}>
          <span
            style={{
              fontFamily: style.textStyle.fontFamily,
              fontSize: style.textStyle.fontSize,
              fontWeight: style.textStyle.fontWeight,
              color: style.textStyle.color,
              textShadow: getTextShadow(false),
              WebkitTextStroke: style.textStyle.strokeWidth
                ? `${style.textStyle.strokeWidth}px ${style.textStyle.strokeColor}`
                : undefined,
            }}
          >
            {text}
          </span>
        </div>
      </div>
    );
  }

  // Animated karaoke caption
  return (
    <div style={containerStyle}>
      <div style={textContainerStyle}>
        {currentChunk.map((word, i) => {
          const globalIndex = chunkStartIndex + i;
          const isHighlighted = globalIndex <= currentWordIndex;

          return (
            <span
              key={`${currentChunkIndex}-${i}`}
              style={{
                fontFamily: style.textStyle.fontFamily,
                fontSize: style.textStyle.fontSize,
                fontWeight: style.textStyle.fontWeight,
                color: isHighlighted
                  ? style.textStyle.highlightColor || style.textStyle.color
                  : style.textStyle.color,
                textShadow: getTextShadow(isHighlighted),
                WebkitTextStroke: style.textStyle.strokeWidth
                  ? `${style.textStyle.strokeWidth}px ${style.textStyle.strokeColor}`
                  : undefined,
                transition: 'color 0.1s ease',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
