export enum GenerationStatus {
  IDLE = 'IDLE',
  SCRIPTING = 'SCRIPTING',
  GENERATING_ASSETS = 'GENERATING_ASSETS',
  READY = 'READY',
  ERROR = 'ERROR'
}

export interface ScriptItem {
  scene_number: number;
  narration: string;
  visual_prompt: string;
}

export interface GeneratedScene extends ScriptItem {
  id: string;
  imageUrl?: string;
  audioBuffer?: AudioBuffer;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

export interface GenerationProgress {
  currentStep: string;
  completedScenes: number;
  totalScenes: number;
}
