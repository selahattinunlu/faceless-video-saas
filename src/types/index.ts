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
  enterTransition?: Transition;
  exitTransition?: Transition;
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
  image_style: string | null;
  custom_image_style: string | null;
  voice_id: string | null;
  wizard_step: string | null;
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
  enter_transition: Transition | null;
  exit_transition: Transition | null;
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

// Scene Transition Types
export type TransitionType =
  | 'none'
  | 'fade'
  | 'blur'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'zoom';

export interface Transition {
  type: TransitionType;
  durationMs: number;
}

export interface TransitionTypeConfig {
  id: TransitionType;
  name: string;
  description: string;
}

export const TRANSITION_TYPES: TransitionTypeConfig[] = [
  { id: 'none', name: 'None', description: 'No transition' },
  { id: 'fade', name: 'Fade', description: 'Fade in/out' },
  { id: 'blur', name: 'Blur', description: 'Blur with fade' },
  { id: 'slide-left', name: 'Slide Left', description: 'Slide from right' },
  { id: 'slide-right', name: 'Slide Right', description: 'Slide from left' },
  { id: 'slide-up', name: 'Slide Up', description: 'Slide from bottom' },
  { id: 'slide-down', name: 'Slide Down', description: 'Slide from top' },
  { id: 'zoom', name: 'Zoom', description: 'Zoom in with fade' },
];

export const DEFAULT_TRANSITION: Transition = { type: 'fade', durationMs: 500 };

// Wizard Types
export type WizardStep = 'input' | 'scenes' | 'style' | 'generating';
export type InputMode = 'prompt' | 'transcript';

export interface EditableScene {
  id: string;
  scene_number: number;
  narration: string;
  visual_prompt: string;
}

// Image Style Types
export type ImageStyleId =
  | 'cinematic'
  | 'realistic'
  | 'anime'
  | 'cartoon'
  | 'watercolor'
  | 'minimalist'
  | 'oil-painting'
  | 'pixel-art'
  | 'comic-book'
  | '3d-render'
  | 'sketch'
  | 'vintage'
  | 'custom';

export interface ImageStyle {
  id: ImageStyleId;
  name: string;
  description: string;
  promptPrefix: string;
}

export const IMAGE_STYLES: ImageStyle[] = [
  { id: 'cinematic', name: 'Cinematic', description: 'Film-like quality with dramatic lighting', promptPrefix: 'cinematic style, dramatic lighting, film grain, movie scene,' },
  { id: 'realistic', name: 'Realistic', description: 'Photorealistic imagery', promptPrefix: 'photorealistic, highly detailed, 8k resolution, sharp focus,' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style', promptPrefix: 'anime style, vibrant colors, clean lines, Studio Ghibli inspired,' },
  { id: 'cartoon', name: 'Cartoon', description: 'Fun cartoon illustration', promptPrefix: 'cartoon style, bold outlines, bright colors, playful,' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft watercolor painting', promptPrefix: 'watercolor painting, soft edges, flowing colors, artistic,' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple design', promptPrefix: 'minimalist style, clean design, simple shapes, limited colors,' },
  { id: 'oil-painting', name: 'Oil Painting', description: 'Classical oil painting style', promptPrefix: 'oil painting style, rich textures, classical art, brush strokes visible,' },
  { id: 'pixel-art', name: 'Pixel Art', description: 'Retro pixel graphics', promptPrefix: 'pixel art style, 16-bit, retro game aesthetic, pixelated,' },
  { id: 'comic-book', name: 'Comic Book', description: 'Bold comic book style', promptPrefix: 'comic book style, bold lines, halftone dots, dynamic composition,' },
  { id: '3d-render', name: '3D Render', description: 'Modern 3D graphics', promptPrefix: '3D render, octane render, volumetric lighting, high quality CGI,' },
  { id: 'sketch', name: 'Sketch', description: 'Pencil sketch drawing', promptPrefix: 'pencil sketch, hand-drawn, graphite, artistic sketch,' },
  { id: 'vintage', name: 'Vintage', description: 'Retro vintage aesthetic', promptPrefix: 'vintage style, retro aesthetic, faded colors, nostalgic, 1970s,' },
  { id: 'custom', name: 'Custom', description: 'Enter your own style', promptPrefix: '' },
];

// Voice Types
export type VoiceId = 'Kore' | 'Aoede' | 'Charon' | 'Fenrir' | 'Puck';

export interface Voice {
  id: VoiceId;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
}

export const VOICES: Voice[] = [
  { id: 'Kore', name: 'Kore', description: 'Clear and professional', gender: 'female' },
  { id: 'Aoede', name: 'Aoede', description: 'Smooth and melodic', gender: 'female' },
  { id: 'Charon', name: 'Charon', description: 'Deep and authoritative', gender: 'male' },
  { id: 'Fenrir', name: 'Fenrir', description: 'Energetic and dynamic', gender: 'male' },
  { id: 'Puck', name: 'Puck', description: 'Playful and expressive', gender: 'neutral' },
];
