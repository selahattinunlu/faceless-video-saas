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
