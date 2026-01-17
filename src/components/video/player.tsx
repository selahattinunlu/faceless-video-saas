'use client';

import React, { useRef, useState } from 'react';
import { GeneratedScene, CaptionStyleId, CaptionPosition } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Loader2 } from 'lucide-react';
import { CaptionRenderer } from '@/lib/caption-renderer';

interface PlayerProps {
  scenes: GeneratedScene[];
  captionStyle?: CaptionStyleId;
  captionPosition?: CaptionPosition;
}

export function Player({ scenes, captionStyle = 'classic', captionPosition = 'bottom' }: PlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const captionRendererRef = useRef<CaptionRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const sceneStartTimeRef = useRef<number>(0);

  // Refs to track latest caption style/position for use in animation loops
  const captionStyleRef = useRef(captionStyle);
  const captionPositionRef = useRef(captionPosition);

  // Keep refs in sync with props
  React.useEffect(() => {
    captionStyleRef.current = captionStyle;
    captionPositionRef.current = captionPosition;
  }, [captionStyle, captionPosition]);

  // Initialize Canvas
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (scenes.length > 0 && scenes[0].imageUrl) {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = scenes[0].imageUrl;
          img.onload = () => {
            drawToCanvas(ctx, img, canvas.width, canvas.height);

            // Initialize caption renderer and show first scene caption
            if (!captionRendererRef.current) {
              captionRendererRef.current = new CaptionRenderer(ctx);
            }
            captionRendererRef.current.renderStatic({
              text: scenes[0].narration,
              styleId: captionStyle,
              position: captionPosition,
              canvasWidth: canvas.width,
              canvasHeight: canvas.height,
            });
          };
        }
      }
    }
  }, [scenes, captionStyle, captionPosition]);

  const drawToCanvas = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) => {
    const scale = Math.max(w / img.width, h / img.height);
    const x = (w / 2) - (img.width / 2) * scale;
    const y = (h / 2) - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
  };

  const stopPlayback = () => {
    if (activeSourceRef.current) {
      activeSourceRef.current.stop();
      activeSourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsPlaying(false);
  };

  const playScene = async (index: number, ctx: AudioContext, destination?: MediaStreamAudioDestinationNode) => {
    if (index >= scenes.length) {
      setIsPlaying(false);
      setCurrentSceneIndex(0);
      return;
    }

    setCurrentSceneIndex(index);
    const scene = scenes[index];
    const canvas = canvasRef.current;
    
    if (canvas && scene.imageUrl) {
      const context = canvas.getContext('2d');
      if (context) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = scene.imageUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
          if (img.complete) {
            resolve(true);
          }
        });
        drawToCanvas(context, img, canvas.width, canvas.height);

        // Initialize caption renderer
        if (!captionRendererRef.current) {
          captionRendererRef.current = new CaptionRenderer(context);
        }

        const durationMs = scene.audioBuffer
          ? scene.audioBuffer.duration * 1000
          : 3000;

        // Setup for animated styles
        captionRendererRef.current.setup(scene.narration, captionStyleRef.current, durationMs);
        sceneStartTimeRef.current = performance.now();

        // Cancel any existing animation
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        // Start animation loop for animated styles
        const animate = () => {
          if (!canvas || !context) return;

          const elapsedMs = performance.now() - sceneStartTimeRef.current;

          // Redraw image
          drawToCanvas(context, img, canvas.width, canvas.height);

          // Render caption with current elapsed time (using refs for live updates)
          captionRendererRef.current?.render({
            text: scene.narration,
            styleId: captionStyleRef.current,
            position: captionPositionRef.current,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            durationMs,
            elapsedMs,
          });

          if (elapsedMs < durationMs) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };

        animate();
      }
    }

    if (scene.audioBuffer) {
      const source = ctx.createBufferSource();
      source.buffer = scene.audioBuffer;
      source.connect(ctx.destination);
      
      if (destination) {
        source.connect(destination);
      }

      activeSourceRef.current = source;
      source.start(0);

      source.onended = () => {
        playScene(index + 1, ctx, destination);
      };
    } else {
      setTimeout(() => {
        playScene(index + 1, ctx, destination);
      }, 3000);
    }
  };

  const handlePlay = () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    
    setIsPlaying(true);
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    playScene(0, audioContextRef.current);
  };

  const startExportSequence = async () => {
    if (!canvasRef.current) {
      return;
    }
    
    setIsExporting(true);
    setIsPlaying(true);
    
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const dest = ctx.createMediaStreamDestination();
    const canvasStream = canvasRef.current.captureStream(30);
    const combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const mediaRecorder = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
    
    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-short.mp4';
      a.click();
      setIsExporting(false);
      setIsPlaying(false);
    };

    mediaRecorder.start();

    for (let i = 0; i < scenes.length; i++) {
      setCurrentSceneIndex(i);
      const scene = scenes[i];

      if (canvasRef.current && scene.imageUrl) {
        const c = canvasRef.current.getContext('2d');
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = scene.imageUrl;
        await new Promise(r => { img.onload = r; });

        if (c) {
          const durationMs = scene.audioBuffer
            ? scene.audioBuffer.duration * 1000
            : 2000;

          // Initialize renderer for export
          const exportRenderer = new CaptionRenderer(c);
          exportRenderer.setup(scene.narration, captionStyle, durationMs);

          const startTime = performance.now();

          // Animate during audio playback
          const animateExport = () => {
            if (!canvasRef.current || !c) return;

            const elapsedMs = performance.now() - startTime;
            drawToCanvas(c, img, canvasRef.current.width, canvasRef.current.height);
            exportRenderer.render({
              text: scene.narration,
              styleId: captionStyle,
              position: captionPosition,
              canvasWidth: canvasRef.current.width,
              canvasHeight: canvasRef.current.height,
              durationMs,
              elapsedMs,
            });

            if (elapsedMs < durationMs) {
              requestAnimationFrame(animateExport);
            }
          };

          animateExport();
        }
      }

      if (scene.audioBuffer) {
        const source = ctx.createBufferSource();
        source.buffer = scene.audioBuffer;
        source.connect(dest);
        source.start(0);
        await new Promise(r => { source.onended = r; });
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    mediaRecorder.stop();
    ctx.close();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto bg-card rounded-2xl p-4 shadow-2xl border border-border">
      <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-inner mb-4">
        <canvas 
          ref={canvasRef} 
          width={540} 
          height={960} 
          className="w-full h-full object-cover"
        />
        
        {!isPlaying && !isExporting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition-opacity hover:bg-black/30">
            <button 
              onClick={handlePlay}
              className="bg-white text-black rounded-full p-4 hover:scale-110 transition-transform shadow-lg"
            >
              <Play className="h-10 w-10" />
            </button>
          </div>
        )}
        
        {isExporting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20">
            <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
            <span className="text-white font-medium">Video Oluşturuluyor...</span>
            <span className="text-white/60 text-sm mt-2">Lütfen bekleyin</span>
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
          <span>Sahne {currentSceneIndex + 1} / {scenes.length}</span>
          <span className={isPlaying ? "text-green-400 animate-pulse" : ""}>
            {isPlaying ? "Oynatılıyor" : "Hazır"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handlePlay}
            disabled={isExporting}
            variant={isPlaying ? "secondary" : "default"}
            className="py-6"
          >
            {isPlaying ? (
              <>
                <Pause className="w-5 h-5 mr-2" />
                Durdur
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Önizle
              </>
            )}
          </Button>
          
          <Button 
            onClick={startExportSequence}
            disabled={isExporting || isPlaying}
            variant="default"
            className="py-6 bg-indigo-600 hover:bg-indigo-500"
          >
            <Download className="w-5 h-5 mr-2" />
            İndir (.mp4)
          </Button>
        </div>
      </div>
    </div>
  );
}
