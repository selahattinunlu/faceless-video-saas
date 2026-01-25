'use client';

import { useState } from 'react';
import {
  ImageStyleId,
  VoiceId,
  CaptionStyleId,
  CaptionPosition,
  LanguageCode,
  EditableScene,
  ProjectWithScenes,
} from '@/types';
import { ImageStyleSelector } from './image-style-selector';
import { VoiceSelector } from './voice-selector';
import { CaptionStyleSelector } from '@/components/video/caption-style-selector';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { createProject, updateProjectSettings } from '@/actions/projects';
import { saveScenesToProject } from '@/actions/generate-script';

interface StepStyleProps {
  imageStyle: ImageStyleId;
  customImageStyle: string;
  captionStyle: CaptionStyleId;
  captionPosition: CaptionPosition;
  voiceId: VoiceId;
  language: LanguageCode;
  projectId: string | null;
  scenes: EditableScene[];
  onImageStyleChange: (style: ImageStyleId) => void;
  onCustomImageStyleChange: (value: string) => void;
  onCaptionStyleChange: (style: CaptionStyleId) => void;
  onCaptionPositionChange: (position: CaptionPosition) => void;
  onVoiceChange: (voice: VoiceId) => void;
  onBack: () => void;
  onStartGeneration: (project: ProjectWithScenes) => void;
}

export function StepStyle({
  imageStyle,
  customImageStyle,
  captionStyle,
  captionPosition,
  voiceId,
  language,
  projectId,
  scenes,
  onImageStyleChange,
  onCustomImageStyleChange,
  onCaptionStyleChange,
  onCaptionPositionChange,
  onVoiceChange,
  onBack,
  onStartGeneration,
}: StepStyleProps) {
  const [isStarting, setIsStarting] = useState(false);

  const handleStartGeneration = async () => {
    setIsStarting(true);
    try {
      // Create project if not exists
      let currentProjectId = projectId;
      if (!currentProjectId) {
        const title = scenes[0]?.narration.slice(0, 50) || 'Untitled Video';
        const project = await createProject(title, title, language);
        currentProjectId = project.id;
      }

      // Save scenes to project
      const savedScenes = await saveScenesToProject(currentProjectId, scenes);

      // Update project settings
      await updateProjectSettings(currentProjectId, {
        imageStyle,
        customImageStyle: imageStyle === 'custom' ? customImageStyle : null,
        voiceId,
        captionStyle,
        captionPosition,
        wizardStep: 'generating',
      });

      // Create full project object for generation step
      const fullProject: ProjectWithScenes = {
        id: currentProjectId,
        user_id: '',
        title: scenes[0]?.narration.slice(0, 50) || 'Untitled Video',
        prompt: '',
        status: 'generating',
        language,
        caption_style: captionStyle,
        caption_position: captionPosition,
        image_style: imageStyle,
        custom_image_style: imageStyle === 'custom' ? customImageStyle : null,
        voice_id: voiceId,
        wizard_step: 'generating',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        scenes: savedScenes,
      };

      onStartGeneration(fullProject);
    } catch (error) {
      console.error('Failed to start generation:', error);
      setIsStarting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Choose Your Style</h2>
        <p className="text-muted-foreground">
          Customize the look and sound of your video.
        </p>
      </div>

      <div className="space-y-8">
        <ImageStyleSelector
          selectedStyle={imageStyle}
          customStyle={customImageStyle}
          onStyleChange={onImageStyleChange}
          onCustomStyleChange={onCustomImageStyleChange}
        />

        <div className="border-t pt-8">
          <CaptionStyleSelector
            value={captionStyle}
            onChange={onCaptionStyleChange}
            position={captionPosition}
            onPositionChange={onCaptionPositionChange}
          />
        </div>

        <div className="border-t pt-8">
          <VoiceSelector
            selectedVoice={voiceId}
            language={language}
            onVoiceChange={onVoiceChange}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onBack} disabled={isStarting}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button type="button" onClick={handleStartGeneration} disabled={isStarting}>
          {isStarting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
