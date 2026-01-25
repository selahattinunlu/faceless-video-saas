'use client';

import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Player as RemotionPlayer, PlayerRef } from '@remotion/player';
import { GeneratedScene, CaptionStyleId, CaptionPosition } from '@/types';
import { ShortVideo } from '@/remotion';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Loader2, RotateCcw } from 'lucide-react';

interface PlayerProps {
  scenes: GeneratedScene[];
  captionStyle?: CaptionStyleId;
  captionPosition?: CaptionPosition;
}

const FPS = 30;
const WIDTH = 540;
const HEIGHT = 960;

export function Player({
  scenes,
  captionStyle = 'classic',
  captionPosition = 'bottom',
}: PlayerProps) {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Event listeners for player state
  useEffect(() => {
    const { current } = playerRef;
    if (!current) {
      return;
    }

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    current.addEventListener('play', onPlay);
    current.addEventListener('pause', onPause);
    current.addEventListener('ended', onEnded);

    return () => {
      current.removeEventListener('play', onPlay);
      current.removeEventListener('pause', onPause);
      current.removeEventListener('ended', onEnded);
    };
  }, []);

  // Toplam duration hesapla
  const totalDurationInFrames = useMemo(() => {
    return scenes.reduce((acc, scene) => {
      const durationMs = scene.durationMs || (scene.audioBuffer?.duration || 3) * 1000;
      return acc + Math.ceil((durationMs / 1000) * FPS);
    }, 0);
  }, [scenes]);

  // Scenes'i hazırla (audioUrl ve durationMs ekle)
  const preparedScenes = useMemo(() => {
    return scenes.map((scene) => ({
      ...scene,
      durationMs: scene.durationMs || (scene.audioBuffer?.duration || 3) * 1000,
    }));
  }, [scenes]);

  const inputProps = useMemo(
    () => ({
      scenes: preparedScenes,
      captionStyle,
      captionPosition,
    }),
    [preparedScenes, captionStyle, captionPosition]
  );

  const handlePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause();
      } else {
        playerRef.current.play();
      }
    }
  }, [isPlaying]);

  const handleRestart = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.play();
    }
  }, []);

  const handleExport = useCallback(async () => {
    if (!playerRef.current) {
      return;
    }

    setIsExporting(true);

    try {
      const playerElement = playerRef.current.getContainerNode();
      if (!playerElement) {
        throw new Error('Player container not found');
      }

      // Video elementini bul
      const videoElement = playerElement.querySelector('video');
      const canvasElement = playerElement.querySelector('canvas');

      let stream: MediaStream;

      if (canvasElement) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stream = (canvasElement as any).captureStream(FPS);
      } else if (videoElement) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        stream = (videoElement as any).captureStream();
      } else {
        throw new Error('No video or canvas element found');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
      };

      mediaRecorder.start();
      playerRef.current.seekTo(0);
      playerRef.current.play();

      // Video bitince dur
      const durationMs = (totalDurationInFrames / FPS) * 1000;
      setTimeout(() => {
        mediaRecorder.stop();
        playerRef.current?.pause();
      }, durationMs + 500);
    } catch (error) {
      console.error('Export error:', error);
      setIsExporting(false);
    }
  }, [totalDurationInFrames]);

  if (scenes.length === 0) {
    return (
      <div className="flex items-center justify-center w-full max-w-sm mx-auto aspect-[9/16] bg-muted rounded-lg">
        <span className="text-muted-foreground">No scenes available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto bg-card rounded-2xl p-4 shadow-2xl border border-border">
      <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-inner mb-4">
        <RemotionPlayer
          ref={playerRef}
          component={ShortVideo}
          inputProps={inputProps}
          durationInFrames={totalDurationInFrames || 1}
          compositionWidth={WIDTH}
          compositionHeight={HEIGHT}
          fps={FPS}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          loop={false}
          autoPlay={false}
          clickToPlay={false}
        />

        {/* Export Overlay */}
        {isExporting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
            <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
            <span className="text-white font-medium">Exporting video...</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
          <span>{scenes.length} scenes</span>
          <span className={isPlaying ? 'text-green-400 animate-pulse' : ''}>
            {isPlaying ? 'Playing' : 'Ready'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button onClick={handleRestart} variant="outline" className="py-6">
            <RotateCcw className="w-5 h-5" />
          </Button>

          <Button
            onClick={handlePlayPause}
            disabled={isExporting}
            variant={isPlaying ? 'secondary' : 'default'}
            className="py-6"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>

          <Button
            onClick={handleExport}
            disabled={isExporting || isPlaying}
            variant="default"
            className="py-6 bg-indigo-600 hover:bg-indigo-500"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
