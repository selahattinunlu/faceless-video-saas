'use client';

import { useState, useTransition } from 'react';
import { GenerationStatus, GeneratedScene } from '@/types';
import { generateScript } from '@/actions/generate-script';
import { generateSceneImage } from '@/actions/generate-image';
import { generateSceneAudio } from '@/actions/generate-audio';
import { decodeGeminiAudio } from '@/lib/audio-decoder';
import { PromptInput } from '@/components/prompt-input';
import { Storyboard } from '@/components/video/storyboard';
import { Player } from '@/components/video/player';
import { Video, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const updateScene = (id: string, updates: Partial<GeneratedScene>) => {
    setScenes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      return;
    }

    setStatus(GenerationStatus.SCRIPTING);
    setError(null);
    setScenes([]);

    startTransition(async () => {
      try {
        // 1. Generate Script
        const scriptItems = await generateScript(prompt);

        const initialScenes: GeneratedScene[] = scriptItems.map(item => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending'
        }));

        setScenes(initialScenes);
        setStatus(GenerationStatus.GENERATING_ASSETS);

        // 2. Generate Assets for each scene
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        await Promise.all(initialScenes.map(async (scene) => {
          updateScene(scene.id, { status: 'loading' });

          try {
            const [imageUrl, audioBase64] = await Promise.all([
              generateSceneImage(scene.visual_prompt),
              generateSceneAudio(scene.narration)
            ]);

            const audioBuffer = await decodeGeminiAudio(audioBase64, audioContext);

            updateScene(scene.id, {
              imageUrl,
              audioBuffer,
              status: 'complete'
            });
          } catch (err) {
            console.error(`Error generating scene ${scene.scene_number}:`, err);
            updateScene(scene.id, { status: 'error' });
          }
        }));

        setStatus(GenerationStatus.READY);

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Bir hata oluştu.");
        setStatus(GenerationStatus.ERROR);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-cyan-500 selection:text-black">

      {/* Header */}
      <header className="py-6 border-b border-border bg-background/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Geri</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-teal-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Video className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ShortsAI
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Powered by Gemini</span>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full flex flex-col gap-12">

        {/* Input Section */}
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Fikirden Videoya, <br/>
              <span className="text-cyan-400">Saniyeler Icinde.</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Istedigin konuyu yaz, yapay zeka senin icin senaryoyu yazsin, gorselleri uretsin ve seslendirsin.
            </p>
          </div>

          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onGenerate={handleGenerate}
            status={status}
          />

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results Area */}
        {scenes.length > 0 && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="w-full h-px bg-border" />

            <div className="flex flex-col lg:flex-row gap-12">
              {/* Left: Player (Sticky) */}
              <div className="lg:w-1/3 order-1 lg:order-2">
                <div className="sticky top-28">
                  <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    Onizleme
                  </h3>
                  {scenes.every(s => s.status === 'complete') ? (
                    <Player scenes={scenes} />
                  ) : (
                    <div className="w-full aspect-[9/16] bg-muted/50 rounded-2xl border border-dashed border-border flex items-center justify-center text-muted-foreground animate-pulse">
                      Tum sahneler hazirlaniyor...
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Storyboard */}
              <div className="lg:w-2/3 order-2 lg:order-1">
                <div className="flex justify-between items-end mb-6">
                  <h3 className="text-xl font-semibold">Storyboard</h3>
                  <span className="text-sm text-muted-foreground">
                    {scenes.filter(s => s.status === 'complete').length} / {scenes.length} Hazir
                  </span>
                </div>
                <Storyboard scenes={scenes} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
