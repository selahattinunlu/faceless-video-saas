'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams } from 'next/navigation';
import { ProjectWithScenes, GeneratedScene, CaptionStyleId, CaptionPosition, ImageEffectId } from '@/types';
import { getProject, updateProjectCaptionSettings, updateSceneEffect } from '@/actions/projects';
import { fetchAndDecodeAudio } from '@/lib/audio-decoder';
import { Storyboard } from '@/components/video/storyboard';
import { Player } from '@/components/video/player';
import { CaptionStyleSelector } from '@/components/video/caption-style-selector';
import { Video, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectWithScenes | null>(null);
  const [scenes, setScenes] = useState<GeneratedScene[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Caption settings state (editable)
  const [captionStyle, setCaptionStyle] = useState<CaptionStyleId>('classic');
  const [captionPosition, setCaptionPosition] = useState<CaptionPosition>('bottom');
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await getProject(projectId);
      if (!data) {
        setError('Project not found');
        return;
      }

      setProject(data);
      setCaptionStyle(data.caption_style || 'classic');
      setCaptionPosition(data.caption_position || 'bottom');

      // Convert DB scenes to GeneratedScene format
      const generatedScenes: GeneratedScene[] = data.scenes.map(scene => ({
        id: scene.id,
        scene_number: scene.scene_number,
        narration: scene.narration,
        visual_prompt: scene.visual_prompt,
        imageUrl: scene.image_url || undefined,
        audioUrl: scene.audio_url || undefined,
        durationMs: scene.duration_ms || undefined,
        effect: scene.effect,
        status: scene.status === 'completed' ? 'complete' : scene.status === 'failed' ? 'error' : 'pending'
      }));

      setScenes(generatedScenes);

      // Load audio for completed scenes
      if (data.status === 'completed') {
        setLoadingAudio(true);
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

        await Promise.all(data.scenes.map(async (scene) => {
          if (scene.audio_url) {
            try {
              const audioBuffer = await fetchAndDecodeAudio(scene.audio_url, audioContext);
              setScenes(prev => prev.map(s =>
                s.id === scene.id ? {
                  ...s,
                  audioBuffer,
                  audioUrl: scene.audio_url || undefined,
                  durationMs: audioBuffer.duration * 1000
                } : s
              ));
            } catch (err) {
              console.error(`Failed to load audio for scene ${scene.scene_number}:`, err);
            }
          }
        }));

        setLoadingAudio(false);
      }

    } catch (err) {
      console.error('Failed to load project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = (style: CaptionStyleId) => {
    setCaptionStyle(style);
    saveCaptionSettings(style, captionPosition);
  };

  const handlePositionChange = (position: CaptionPosition) => {
    setCaptionPosition(position);
    saveCaptionSettings(captionStyle, position);
  };

  const saveCaptionSettings = (style: CaptionStyleId, position: CaptionPosition) => {
    startSaving(async () => {
      try {
        await updateProjectCaptionSettings(projectId, style, position);
      } catch (err) {
        console.error('Failed to save caption settings:', err);
      }
    });
  };

  const handleEffectChange = (sceneId: string, effect: ImageEffectId) => {
    setScenes(prev => prev.map(s => s.id === sceneId ? { ...s, effect } : s));
    startSaving(async () => {
      try {
        await updateSceneEffect(sceneId, effect);
      } catch (err) {
        console.error('Failed to save effect:', err);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-semibold">{error || 'Project not found'}</h1>
        <Link href="/projects" className="text-cyan-400 hover:underline">
          Back to My Videos
        </Link>
      </div>
    );
  }

  const isReady = project.status === 'completed' && scenes.every(s => s.audioBuffer);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="py-6 border-b border-border bg-background/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-cyan-400 to-teal-500 w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Video className="h-6 w-6 text-black" />
              </div>
              <h1 className="text-xl font-bold tracking-tight line-clamp-1 max-w-md">
                {project.title}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left: Player */}
          <div className="lg:w-1/3 order-1 lg:order-2">
            <div className="sticky top-28">
              <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-amber-500'}`} />
                Preview
              </h3>
              {isReady ? (
                <Player
                  scenes={scenes}
                  captionStyle={captionStyle}
                  captionPosition={captionPosition}
                />
              ) : loadingAudio ? (
                <div className="w-full aspect-[9/16] bg-muted/50 rounded-2xl border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading audio...</span>
                </div>
              ) : (
                <div className="w-full aspect-[9/16] bg-muted/50 rounded-2xl border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  {project.status === 'generating' ? 'Generating...' : 'Incomplete'}
                </div>
              )}
            </div>
          </div>

          {/* Right: Info & Storyboard */}
          <div className="lg:w-2/3 order-2 lg:order-1 space-y-8">
            {/* Project Info */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-2">Prompt</h2>
              <p className="text-muted-foreground">{project.prompt}</p>
            </div>

            {/* Caption Settings */}
            <div className="bg-card border border-border rounded-xl p-6">
              <CaptionStyleSelector
                value={captionStyle}
                onChange={handleStyleChange}
                position={captionPosition}
                onPositionChange={handlePositionChange}
              />
            </div>

            {/* Storyboard */}
            <div>
              <div className="flex justify-between items-end mb-6">
                <h3 className="text-xl font-semibold">Storyboard</h3>
                <span className="text-sm text-muted-foreground">
                  {scenes.filter(s => s.status === 'complete').length} / {scenes.length} Ready
                </span>
              </div>
              <Storyboard scenes={scenes} onEffectChange={handleEffectChange} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
