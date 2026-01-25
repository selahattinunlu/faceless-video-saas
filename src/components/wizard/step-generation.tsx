'use client';

import { useEffect, useState, useCallback } from 'react';
import { Scene, ProjectWithScenes, CaptionStyleId, CaptionPosition, IMAGE_STYLES, ImageStyleId, GeneratedScene, ImageEffectId, Transition, DEFAULT_TRANSITION } from '@/types';
import { generateSceneImage } from '@/actions/generate-image';
import { generateSceneAudio, markSceneCompleted } from '@/actions/generate-audio';
import { updateProjectStatus, updateSceneEffect, updateSceneTransitions } from '@/actions/projects';
import { decrementCredits } from '@/actions/credits';
import { fetchAndDecodeAudio } from '@/lib/audio-decoder';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, XCircle, ImageIcon, Volume2 } from 'lucide-react';
import { Player } from '@/components/video/player';
import { Storyboard } from '@/components/video/storyboard';

// Convert Scene to GeneratedScene format
function sceneToGeneratedScene(scene: Scene): GeneratedScene {
  return {
    id: scene.id,
    scene_number: scene.scene_number,
    narration: scene.narration,
    visual_prompt: scene.visual_prompt,
    effect: scene.effect,
    imageUrl: scene.image_url || undefined,
    audioUrl: scene.audio_url || undefined,
    durationMs: scene.duration_ms || undefined,
    status: scene.status === 'completed' ? 'complete' :
            scene.status === 'generating' ? 'loading' :
            scene.status === 'failed' ? 'error' : 'pending',
    enterTransition: scene.enter_transition || DEFAULT_TRANSITION,
    exitTransition: scene.exit_transition || DEFAULT_TRANSITION,
  };
}

interface StepGenerationProps {
  project: ProjectWithScenes;
  voiceId: string;
  imageStyle: ImageStyleId;
  customImageStyle: string;
  captionStyle: CaptionStyleId;
  captionPosition: CaptionPosition;
  onComplete: (updatedProject: ProjectWithScenes) => void;
}

interface SceneProgress {
  id: string;
  imageStatus: 'pending' | 'loading' | 'complete' | 'error';
  audioStatus: 'pending' | 'loading' | 'complete' | 'error';
}

export function StepGeneration({
  project,
  voiceId,
  imageStyle,
  customImageStyle,
  captionStyle,
  captionPosition,
  onComplete,
}: StepGenerationProps) {
  const [sceneProgress, setSceneProgress] = useState<SceneProgress[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<GeneratedScene[]>(
    project.scenes.map(sceneToGeneratedScene)
  );

  // Get the image style prefix
  const getStylePrefix = () => {
    if (imageStyle === 'custom') {
      return customImageStyle;
    }
    const style = IMAGE_STYLES.find((s) => s.id === imageStyle);
    return style?.promptPrefix || '';
  };

  useEffect(() => {
    if (!isGenerating && sceneProgress.length === 0) {
      startGeneration();
    }
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);

    // Initialize progress for all scenes
    const initialProgress: SceneProgress[] = project.scenes.map((scene) => ({
      id: scene.id,
      imageStatus: 'pending',
      audioStatus: 'pending',
    }));
    setSceneProgress(initialProgress);

    const stylePrefix = getStylePrefix();

    // Generate all scenes in parallel
    const results = await Promise.allSettled(
      project.scenes.map(async (scene) => {
        // Update status to loading
        setSceneProgress((prev) =>
          prev.map((p) =>
            p.id === scene.id
              ? { ...p, imageStatus: 'loading', audioStatus: 'loading' }
              : p
          )
        );

        // Generate image and audio in parallel
        const [imageResult, audioResult] = await Promise.allSettled([
          generateSceneImage(scene.id, stylePrefix),
          generateSceneAudio(scene.id, voiceId),
        ]);

        // Update image status
        const imageUrl = imageResult.status === 'fulfilled' ? imageResult.value : null;
        setSceneProgress((prev) =>
          prev.map((p) =>
            p.id === scene.id
              ? { ...p, imageStatus: imageUrl ? 'complete' : 'error' }
              : p
          )
        );

        // Update audio status
        const audioUrl = audioResult.status === 'fulfilled' ? audioResult.value : null;
        setSceneProgress((prev) =>
          prev.map((p) =>
            p.id === scene.id
              ? { ...p, audioStatus: audioUrl ? 'complete' : 'error' }
              : p
          )
        );

        // Mark scene as completed if both succeeded
        if (imageUrl && audioUrl) {
          await markSceneCompleted(scene.id);

          // Fetch and decode audio for Player
          const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const audioBuffer = await fetchAndDecodeAudio(audioUrl, audioContext);

          // Update generated scenes state
          setGeneratedScenes((prev) =>
            prev.map((s) =>
              s.id === scene.id
                ? {
                    ...s,
                    imageUrl,
                    audioUrl,
                    audioBuffer,
                    durationMs: audioBuffer.duration * 1000,
                    status: 'complete' as const
                  }
                : s
            )
          );
        } else {
          setGeneratedScenes((prev) =>
            prev.map((s) =>
              s.id === scene.id
                ? { ...s, status: 'error' as const }
                : s
            )
          );
        }

        return { sceneId: scene.id, imageUrl, audioUrl };
      })
    );

    // Check if all scenes completed successfully
    const allSuccess = results.every(
      (r) => r.status === 'fulfilled' && r.value.imageUrl && r.value.audioUrl
    );

    if (allSuccess) {
      await updateProjectStatus(project.id, 'completed');
      await decrementCredits();
      setIsComplete(true);

      // Notify parent with updated project
      onComplete({
        ...project,
        status: 'completed',
      });
    }

    setIsGenerating(false);
  };

  // Handle effect change from Storyboard
  const handleEffectChange = useCallback(async (sceneId: string, effect: ImageEffectId) => {
    // Update local state immediately for responsive UI
    setGeneratedScenes((prev) =>
      prev.map((s) =>
        s.id === sceneId ? { ...s, effect } : s
      )
    );

    // Persist to database
    try {
      await updateSceneEffect(sceneId, effect);
    } catch (error) {
      console.error('Failed to update scene effect:', error);
    }
  }, []);

  // Handle transition change from Storyboard
  const handleTransitionChange = useCallback(async (
    sceneId: string,
    type: 'enter' | 'exit',
    transition: Transition
  ) => {
    // Update local state immediately for responsive UI
    setGeneratedScenes((prev) =>
      prev.map((s) => {
        if (s.id !== sceneId) {
          return s;
        }
        if (type === 'enter') {
          return { ...s, enterTransition: transition };
        }
        return { ...s, exitTransition: transition };
      })
    );

    // Persist to database
    try {
      const currentScene = generatedScenes.find((s) => s.id === sceneId);
      if (currentScene) {
        const enterTransition = type === 'enter' ? transition : (currentScene.enterTransition || DEFAULT_TRANSITION);
        const exitTransition = type === 'exit' ? transition : (currentScene.exitTransition || DEFAULT_TRANSITION);
        await updateSceneTransitions(sceneId, enterTransition, exitTransition);
      }
    } catch (error) {
      console.error('Failed to update scene transitions:', error);
    }
  }, [generatedScenes]);

  const completedCount = sceneProgress.filter(
    (p) => p.imageStatus === 'complete' && p.audioStatus === 'complete'
  ).length;
  const totalCount = project.scenes.length;
  const progressPercent = (completedCount / totalCount) * 100;

  if (isComplete) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle2 className="w-6 h-6" />
          <span className="text-lg font-medium">Video generated successfully!</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Player
            scenes={generatedScenes}
            captionStyle={captionStyle}
            captionPosition={captionPosition}
          />
          <Storyboard
            scenes={generatedScenes}
            onEffectChange={handleEffectChange}
            onTransitionChange={handleTransitionChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Generating Your Video</h2>
        <p className="text-muted-foreground">
          Creating images and audio for {totalCount} scenes...
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-sm text-center mt-2 text-muted-foreground">
          {completedCount} of {totalCount} scenes complete
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.scenes.map((scene, index) => {
          const progress = sceneProgress.find((p) => p.id === scene.id);
          return (
            <Card key={scene.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium truncate flex-1">
                    Scene {index + 1}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <ImageIcon className="w-4 h-4" />
                    <span>Image:</span>
                    <StatusIcon status={progress?.imageStatus || 'pending'} />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Volume2 className="w-4 h-4" />
                    <span>Audio:</span>
                    <StatusIcon status={progress?.audioStatus || 'pending'} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: 'pending' | 'loading' | 'complete' | 'error' }) {
  switch (status) {
    case 'pending':
      return <span className="text-muted-foreground">Waiting...</span>;
    case 'loading':
      return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-green-600" />;
    case 'error':
      return <XCircle className="w-4 h-4 text-destructive" />;
  }
}
