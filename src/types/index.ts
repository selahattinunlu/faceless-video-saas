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
  audioUrl?: string;
  durationMs?: number;
  effect?: ImageEffectId;
}

export interface GenerationProgress {
  currentStep: string;
  completedScenes: number;
  totalScenes: number;
}

// Database types
export interface Project {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  language: LanguageCode;
  caption_style: CaptionStyleId;
  caption_position: CaptionPosition;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithScenes extends Project {
  scenes: Scene[];
}

export interface Scene {
  id: string;
  project_id: string;
  scene_number: number;
  narration: string;
  visual_prompt: string;
  image_url: string | null;
  audio_url: string | null;
  duration_ms: number | null;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: string;
  effect: ImageEffectId;
}

export interface GenerationJob {
  id: string;
  scene_id: string;
  job_type: 'script' | 'image' | 'audio';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits_remaining: number;
  total_videos_generated: number;
}

// Language Types
export type LanguageCode = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
];

// Caption Style Types
export type CaptionStyleId = 'classic' | 'bold' | 'minimal' | 'neon';
export type CaptionPosition = 'center' | 'bottom';

export interface CaptionTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  highlightColor?: string; // For karaoke effect
  strokeColor?: string;
  strokeWidth?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface CaptionBackgroundStyle {
  enabled: boolean;
  color: string;
  padding: number;
  borderRadius: number;
}

export interface CaptionAnimationStyle {
  type: 'karaoke';
  wordTransition: 'instant' | 'smooth';
  wordsPerChunk: number; // How many words to show at a time
}

export interface CaptionStyleConfig {
  id: CaptionStyleId;
  name: string;
  supportsAnimation: boolean;
  textStyle: CaptionTextStyle;
  backgroundStyle: CaptionBackgroundStyle;
  animationStyle?: CaptionAnimationStyle;
}

// Image Effect Types
export type ImageEffectId =
  | 'kenburns'
  | 'zoom-in'
  | 'zoom-out'
  | 'pan-left'
  | 'pan-right'
  | 'shake'
  | 'pulse'
  | 'none';

export interface ImageEffect {
  id: ImageEffectId;
  name: string;
  description: string;
}

export const IMAGE_EFFECTS: ImageEffect[] = [
  { id: 'kenburns', name: 'Ken Burns', description: 'Slow zoom with pan' },
  { id: 'zoom-in', name: 'Zoom In', description: 'Gradual zoom in' },
  { id: 'zoom-out', name: 'Zoom Out', description: 'Gradual zoom out' },
  { id: 'pan-left', name: 'Pan Left', description: 'Horizontal pan left' },
  { id: 'pan-right', name: 'Pan Right', description: 'Horizontal pan right' },
  { id: 'shake', name: 'Shake', description: 'Subtle shake effect' },
  { id: 'pulse', name: 'Pulse', description: 'Gentle pulse/breathe' },
  { id: 'none', name: 'None', description: 'No effect' },
];
