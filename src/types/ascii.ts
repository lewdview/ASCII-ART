export type DitherAlgorithm =
  | 'floyd-steinberg'
  | 'atkinson'
  | 'sierra'
  | 'sierra-lite'
  | 'jarvis'
  | 'burkes'
  | 'bayer-2'
  | 'bayer-4'
  | 'bayer-8'
  | 'stucki'
  | 'cluster-dot'
  | 'halftone'
  | 'noise'
  | 'threshold'
  | 'sobel';

export type PalettePreset =
  | 'classic-green'
  | 'amber-crt'
  | 'cyberpunk-neon'
  | 'gameboy'
  | 'commodore64'
  | 'synthwave'
  | 'monochrome'
  | 'paper-ink'
  | 'true-color'
  | 'custom';

export type CharacterSetPreset =
  | 'standard'
  | 'dense'
  | 'blocks'
  | 'braille'
  | 'binary'
  | 'hex'
  | 'matrix-katakana'
  | 'minimal'
  | 'slashes'
  | 'cyber-circuit'
  | 'abstract-geometric'
  | 'kanji-oriental'
  | 'runic-occult'
  | 'math-quantum'
  | 'emoji-density'
  | 'glitch-matrix'
  | 'custom';

export type RenderMode = 'canvas-ascii' | 'text-dom' | 'braille-art';

export interface YouTubeConversionState {
  isConverting: boolean;
  progress: number;
  stage: 'IDLE' | 'RESOLVING_ID' | 'FETCHING_METADATA' | 'PROCESSING_STREAM' | 'INITIALIZING_DITHER' | 'COMPLETE' | 'ERROR';
  statusText: string;
  videoTitle?: string;
  thumbnailUrl?: string;
}

export type SourceType = 'youtube' | 'sample' | 'upload' | 'webcam';

export interface VideoSourceMeta {
  type: SourceType;
  id: string;
  title: string;
  author?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  youtubeId?: string;
  duration?: string;
  aspectRatio?: number;
}

export interface ColorPalette {
  id: PalettePreset;
  name: string;
  bg: string;
  fg: string;
  accent?: string;
  colors?: string[]; // Multi-tone color map
  isTrueColor?: boolean;
}

export interface CharacterSet {
  id: CharacterSetPreset;
  name: string;
  chars: string;
  description: string;
}

export interface DitherConfig {
  columns: number; // e.g. 80, 120, 160, 200
  fontSizeRatio: number; // aspect multiplier (e.g., 0.55)
  algorithm: DitherAlgorithm;
  palette: PalettePreset;
  charset: CharacterSetPreset;
  customCharset: string;
  customFgColor: string;
  customBgColor: string;
  renderMode: RenderMode;
  
  // Image Adjustments
  brightness: number; // -100 to 100
  contrast: number;   // -100 to 100
  gamma: number;      // 0.2 to 2.5
  sharpness: number;  // 0 to 100
  sobelThreshold: number; // 0 to 255
  ditherStrength: number; // 0 to 100
  invertLuminance: boolean;
  colorMode: 'monochrome' | 'palette-map' | 'true-color';
  
  // Retro & CRT Visual Effects
  crtEnabled: boolean;
  scanlinesIntensity: number; // 0 to 1
  bloomGlow: number;          // 0 to 1
  flickerAmount: number;      // 0 to 1
  matrixRainOverlay: boolean;
  crtCurvature: boolean;

  // Audio & Playback
  playbackRate: number; // 0.25, 0.5, 1, 1.25, 1.5, 2
  volume: number;       // 0 to 1
  muted: boolean;
}

export interface PresetStyle {
  id: string;
  name: string;
  description: string;
  iconName: string;
  config: Partial<DitherConfig>;
}

export interface FrameStats {
  fps: number;
  renderTimeMs: number;
  cols: number;
  rows: number;
  totalChars: number;
  currentFrame: number;
}
