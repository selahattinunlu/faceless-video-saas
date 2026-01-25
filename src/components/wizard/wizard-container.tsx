'use client';

import { useState, useCallback } from 'react';
import {
  WizardStep,
  InputMode,
  EditableScene,
  LanguageCode,
  ImageStyleId,
  VoiceId,
  CaptionStyleId,
  CaptionPosition,
  ProjectWithScenes,
} from '@/types';
import { WizardStepper } from './wizard-stepper';
import { StepInput } from './step-input';
import { StepScenes } from './step-scenes';
import { StepStyle } from './step-style';
import { StepGeneration } from './step-generation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export interface WizardState {
  step: WizardStep;
  inputMode: InputMode;
  prompt: string;
  transcript: string;
  language: LanguageCode;
  scenes: EditableScene[];
  imageStyle: ImageStyleId;
  customImageStyle: string;
  captionStyle: CaptionStyleId;
  captionPosition: CaptionPosition;
  voiceId: VoiceId;
  projectId: string | null;
  project: ProjectWithScenes | null;
}

const initialState: WizardState = {
  step: 'input',
  inputMode: 'prompt',
  prompt: '',
  transcript: '',
  language: 'en',
  scenes: [],
  imageStyle: 'cinematic',
  customImageStyle: '',
  captionStyle: 'bold',
  captionPosition: 'bottom',
  voiceId: 'Kore',
  projectId: null,
  project: null,
};

export function WizardContainer() {
  const [state, setState] = useState<WizardState>(initialState);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [pendingStep, setPendingStep] = useState<WizardStep | null>(null);

  const updateState = useCallback((updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step: WizardStep) => {
    // If going back to 'input' from 'scenes' or later, show confirmation
    if (step === 'input' && state.step !== 'input' && state.scenes.length > 0) {
      setPendingStep(step);
      setShowBackConfirm(true);
      return;
    }
    setState((prev) => ({ ...prev, step }));
  }, [state.step, state.scenes.length]);

  const confirmBack = useCallback(() => {
    if (pendingStep) {
      setState((prev) => ({
        ...prev,
        step: pendingStep,
        scenes: [],
        projectId: null,
        project: null,
      }));
    }
    setShowBackConfirm(false);
    setPendingStep(null);
  }, [pendingStep]);

  const nextStep = useCallback(() => {
    const stepOrder: WizardStep[] = ['input', 'scenes', 'style', 'generating'];
    const currentIndex = stepOrder.indexOf(state.step);
    if (currentIndex < stepOrder.length - 1) {
      setState((prev) => ({ ...prev, step: stepOrder[currentIndex + 1] }));
    }
  }, [state.step]);

  const prevStep = useCallback(() => {
    const stepOrder: WizardStep[] = ['input', 'scenes', 'style', 'generating'];
    const currentIndex = stepOrder.indexOf(state.step);
    if (currentIndex > 0) {
      const targetStep = stepOrder[currentIndex - 1];
      goToStep(targetStep);
    }
  }, [state.step, goToStep]);

  return (
    <div className="space-y-8">
      <WizardStepper currentStep={state.step} onStepClick={goToStep} />

      <div className="min-h-[400px]">
        {state.step === 'input' && (
          <StepInput
            inputMode={state.inputMode}
            prompt={state.prompt}
            transcript={state.transcript}
            language={state.language}
            onInputModeChange={(mode) => updateState({ inputMode: mode })}
            onPromptChange={(prompt) => updateState({ prompt })}
            onTranscriptChange={(transcript) => updateState({ transcript })}
            onLanguageChange={(language) => updateState({ language })}
            onScenesGenerated={(scenes, projectId) => {
              updateState({ scenes, projectId });
              nextStep();
            }}
          />
        )}

        {state.step === 'scenes' && (
          <StepScenes
            scenes={state.scenes}
            onScenesChange={(scenes) => updateState({ scenes })}
            onBack={prevStep}
            onNext={nextStep}
          />
        )}

        {state.step === 'style' && (
          <StepStyle
            imageStyle={state.imageStyle}
            customImageStyle={state.customImageStyle}
            captionStyle={state.captionStyle}
            captionPosition={state.captionPosition}
            voiceId={state.voiceId}
            language={state.language}
            onImageStyleChange={(imageStyle) => updateState({ imageStyle })}
            onCustomImageStyleChange={(customImageStyle) => updateState({ customImageStyle })}
            onCaptionStyleChange={(captionStyle) => updateState({ captionStyle })}
            onCaptionPositionChange={(captionPosition) => updateState({ captionPosition })}
            onVoiceChange={(voiceId) => updateState({ voiceId })}
            onBack={prevStep}
            onStartGeneration={(project) => {
              updateState({ project });
              nextStep();
            }}
            projectId={state.projectId}
            scenes={state.scenes}
          />
        )}

        {state.step === 'generating' && state.project && (
          <StepGeneration
            project={state.project}
            voiceId={state.voiceId}
            imageStyle={state.imageStyle}
            customImageStyle={state.customImageStyle}
            captionStyle={state.captionStyle}
            captionPosition={state.captionPosition}
            onComplete={(updatedProject) => updateState({ project: updatedProject })}
          />
        )}
      </div>

      <AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Go back to input?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard your current scenes and you'll need to regenerate them.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBack}>Yes, go back</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
