'use client';

import React, { useRef, useState } from 'react';
import { GeneratedScene } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Loader2 } from 'lucide-react';

interface PlayerProps {
  scenes: GeneratedScene[];
}

export function Player({ scenes }: PlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
          img.src = scenes[0].imageUrl;
          img.onload = () => {
            drawToCanvas(ctx, img, canvas.width, canvas.height);
          };
        }
      }
    }
  }, [scenes]);

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
        
        // Add text overlay
        context.fillStyle = 'rgba(0,0,0,0.6)';
        context.fillRect(0, canvas.height - 150, canvas.width, 150);
        context.font = '24px system-ui, sans-serif';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        
        const words = scene.narration.split(' ');
        let line = '';
        let y = canvas.height - 100;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = context.measureText(testLine);
          if (metrics.width > canvas.width - 40 && n > 0) {
            context.fillText(line, canvas.width / 2, y);
            line = words[n] + ' ';
            y += 30;
          } else {
            line = testLine;
          }
        }
        context.fillText(line, canvas.width / 2, y);
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
          drawToCanvas(c, img, canvasRef.current.width, canvasRef.current.height);
          c.fillStyle = 'rgba(0,0,0,0.6)';
          c.fillRect(0, canvasRef.current.height - 150, canvasRef.current.width, 150);
          c.font = '24px system-ui, sans-serif';
          c.fillStyle = 'white';
          c.textAlign = 'center';
          c.fillText(scene.narration.substring(0, 40) + "...", canvasRef.current.width / 2, canvasRef.current.height - 80);
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
