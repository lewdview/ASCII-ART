import { CharacterSet, CharacterSetPreset, ColorPalette, DitherConfig, PalettePreset, PresetStyle } from '../types/ascii';

export const CHARACTER_SETS: Record<CharacterSetPreset, CharacterSet> = {
  standard: {
    id: 'standard',
    name: 'Classic ASCII',
    chars: ' .:-=+*#%@',
    description: '10-step standard gradient character set'
  },
  dense: {
    id: 'dense',
    name: 'Ultra Dense (68 Chars)',
    chars: ' .`\'"^r!i~;:-+?]*s%S$X#W&8@',
    description: 'High contrast fine gradient mapping'
  },
  blocks: {
    id: 'blocks',
    name: 'Unicode Solid Blocks',
    chars: ' ░▒▓█',
    description: 'Retro arcade solid shade blocks'
  },
  braille: {
    id: 'braille',
    name: 'Braille Matrix (2x4 Dots)',
    chars: '⠀⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿',
    description: '4x pixel resolution via 8-dot braille cells'
  },
  binary: {
    id: 'binary',
    name: 'Binary Digital (0 & 1)',
    chars: ' 01',
    description: 'Minimalist cyber machine code'
  },
  hex: {
    id: 'hex',
    name: 'Hexadecimal Stream',
    chars: ' 0123456789ABCDEF',
    description: 'Core dump memory view charset'
  },
  'matrix-katakana': {
    id: 'matrix-katakana',
    name: 'Matrix Katakana Code',
    chars: ' ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ01234579',
    description: 'Authentic cyberpunk matrix code symbols'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal ASCII',
    chars: ' .:-#',
    description: 'Clean low-clutter glyph set'
  },
  slashes: {
    id: 'slashes',
    name: 'Hatch & Slashes',
    chars: ' .:-/\\|#',
    description: 'Diagonal direction shading'
  },
  'cyber-circuit': {
    id: 'cyber-circuit',
    name: 'Cyber Circuit Tech',
    chars: ' ․·:▫▪⁝⁞⚡⎍⎎⏁⏇█',
    description: 'Futuristic integrated circuit & energy symbols'
  },
  'abstract-geometric': {
    id: 'abstract-geometric',
    name: 'Abstract Geometry',
    chars: ' ․·▫▪◻◼◽◾◆◈❖█',
    description: 'Pure geometric shape & diamond density mapping'
  },
  'kanji-oriental': {
    id: 'kanji-oriental',
    name: 'East Asian Kanji',
    chars: '  一二三四五六七八九十百千萬億龘█',
    description: 'Complex East Asian character stroke gradients'
  },
  'runic-occult': {
    id: 'runic-occult',
    name: 'Norse Elder Runes',
    chars: '  ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛞᛟ█',
    description: 'Ancient esoteric Futhark rune density glyphs'
  },
  'math-quantum': {
    id: 'math-quantum',
    name: 'Quantum Math Calculus',
    chars: '  .+-±×÷√∫∬∇∆∏∑∞≈≡█',
    description: 'Mathematical calculus, physics & operator glyphs'
  },
  'emoji-density': {
    id: 'emoji-density',
    name: 'Shaded Emoji Art',
    chars: '  ░▒▓🌑🌒🌓🌔🌕💥🔥🌟█',
    description: 'Expressive emoji luminance & shaded lunar gradient'
  },
  'glitch-matrix': {
    id: 'glitch-matrix',
    name: 'Glitch Cyber Noise',
    chars: ' .:-=*#@%&$░▒▓█',
    description: 'High contrast distorted cyberpunk noise texture'
  },
  custom: {
    id: 'custom',
    name: 'Custom User Charset',
    chars: ' .:-=+*#%@',
    description: 'Editable custom character sequence'
  }
};

export const PALETTES: Record<PalettePreset, ColorPalette> = {
  'classic-green': {
    id: 'classic-green',
    name: 'VT100 Green Phosphor',
    bg: '#08100A',
    fg: '#00FF66',
    accent: '#33FF88',
    colors: ['#08100A', '#003311', '#008833', '#00FF66', '#88FFBB']
  },
  'amber-crt': {
    id: 'amber-crt',
    name: '80s Amber CRT Monitor',
    bg: '#140A00',
    fg: '#FFB000',
    accent: '#FFD066',
    colors: ['#140A00', '#4A2800', '#995900', '#FFB000', '#FFE088']
  },
  'cyberpunk-neon': {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Synth Neon',
    bg: '#0D001A',
    fg: '#00F0FF',
    accent: '#FF007F',
    colors: ['#0D001A', '#3A0066', '#FF007F', '#7000FF', '#00F0FF', '#FFE600']
  },
  'gameboy': {
    id: 'gameboy',
    name: 'GameBoy 4-Color',
    bg: '#0F380F',
    fg: '#9BBC0F',
    accent: '#8BAC0F',
    colors: ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F']
  },
  'commodore64': {
    id: 'commodore64',
    name: 'Commodore 64 Classic',
    bg: '#4032B3',
    fg: '#A090FF',
    accent: '#7868C8',
    colors: ['#000000', '#FFFFFF', '#880000', '#AEEAEC', '#CCCCCC', '#55CC55', '#0000AA', '#EEEE77', '#DD8855', '#664400', '#FF7777', '#333333', '#777777', '#AAFFA0', '#7777FF', '#BBBBBB']
  },
  'synthwave': {
    id: 'synthwave',
    name: 'Synthwave Sunset',
    bg: '#120024',
    fg: '#FF71CE',
    accent: '#01CDFE',
    colors: ['#120024', '#4E0059', '#990080', '#FF71CE', '#01CDFE', '#05FFA1']
  },
  'monochrome': {
    id: 'monochrome',
    name: 'Pure Monochrome White',
    bg: '#000000',
    fg: '#FFFFFF',
    accent: '#CCCCCC',
    colors: ['#000000', '#444444', '#888888', '#CCCCCC', '#FFFFFF']
  },
  'paper-ink': {
    id: 'paper-ink',
    name: 'Vintage Paper & Ink',
    bg: '#F7F4EB',
    fg: '#1E1E24',
    accent: '#3E3E4B',
    colors: ['#F7F4EB', '#E2DCD0', '#8A857A', '#3E3E4B', '#1E1E24']
  },
  'true-color': {
    id: 'true-color',
    name: 'TrueColor Original RGB',
    bg: '#0A0A0C',
    fg: '#FFFFFF',
    accent: '#00F0FF',
    isTrueColor: true
  },
  'custom': {
    id: 'custom',
    name: 'Custom User Palette',
    bg: '#0A0A0F',
    fg: '#00F0FF',
    accent: '#FF007F'
  }
};

export const MAGIC_STYLE_PRESETS: PresetStyle[] = [
  {
    id: 'matrix-rain',
    name: 'Matrix Cyber Code',
    description: 'Falling Katakana code stream with CRT green phosphor glow',
    iconName: 'Terminal',
    config: {
      columns: 140,
      algorithm: 'floyd-steinberg',
      palette: 'classic-green',
      charset: 'matrix-katakana',
      colorMode: 'monochrome',
      crtEnabled: true,
      scanlinesIntensity: 0.35,
      bloomGlow: 0.4,
      matrixRainOverlay: true,
      contrast: 25,
      brightness: 10
    }
  },
  {
    id: 'gameboy-8bit',
    name: 'GameBoy 4-Color',
    description: 'Retro 8-bit handheld display with Bayer matrix dithering',
    iconName: 'Gamepad2',
    config: {
      columns: 100,
      algorithm: 'bayer-4',
      palette: 'gameboy',
      charset: 'blocks',
      colorMode: 'palette-map',
      crtEnabled: false,
      contrast: 30,
      ditherStrength: 85
    }
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Synthwave',
    description: 'Electric neon tones with Floyd-Steinberg error diffusion',
    iconName: 'Zap',
    config: {
      columns: 130,
      algorithm: 'floyd-steinberg',
      palette: 'cyberpunk-neon',
      charset: 'dense',
      colorMode: 'palette-map',
      crtEnabled: true,
      scanlinesIntensity: 0.25,
      bloomGlow: 0.5,
      contrast: 35,
      brightness: 5
    }
  },
  {
    id: 'atkinson-mac',
    name: '1984 Macintosh Atkinson',
    description: 'Hyper-crisp Atkinson Mac dithering with stark monochrome lines',
    iconName: 'Monitor',
    config: {
      columns: 120,
      algorithm: 'atkinson',
      palette: 'monochrome',
      charset: 'standard',
      colorMode: 'monochrome',
      crtEnabled: false,
      contrast: 40,
      brightness: 15,
      sharpness: 50
    }
  },
  {
    id: 'braille-hd',
    name: 'Braille 4x Resolution',
    description: 'Ultra-high detail ASCII rendering using 8-dot braille cells',
    iconName: 'Grid',
    config: {
      columns: 160,
      algorithm: 'bayer-8',
      palette: 'true-color',
      charset: 'braille',
      colorMode: 'true-color',
      crtEnabled: false,
      contrast: 20,
      brightness: 5
    }
  },
  {
    id: 'sobel-edge-cyber',
    name: 'Sobel Edge Cyber Contour',
    description: 'Holographic edge detection wireframe ASCII video',
    iconName: 'Activity',
    config: {
      columns: 120,
      algorithm: 'sobel',
      palette: 'cyberpunk-neon',
      charset: 'dense',
      sobelThreshold: 60,
      colorMode: 'palette-map',
      crtEnabled: true,
      scanlinesIntensity: 0.3,
      contrast: 50
    }
  },
  {
    id: 'amber-terminal',
    name: '80s Amber Terminal',
    description: 'Warm glowing amber phosphor CRT with scanline curvature',
    iconName: 'Tv',
    config: {
      columns: 110,
      algorithm: 'stucki',
      palette: 'amber-crt',
      charset: 'standard',
      colorMode: 'monochrome',
      crtEnabled: true,
      scanlinesIntensity: 0.45,
      bloomGlow: 0.35,
      crtCurvature: true,
      contrast: 20
    }
  },
  {
    id: 'sierra-cinema',
    name: 'Sierra Cinema Dither',
    description: 'Balanced 3-row Sierra error diffusion with abstract geometry',
    iconName: 'Film',
    config: {
      columns: 130,
      algorithm: 'sierra',
      palette: 'amber-crt',
      charset: 'abstract-geometric',
      colorMode: 'palette-map',
      crtEnabled: true,
      scanlinesIntensity: 0.3,
      contrast: 25
    }
  },
  {
    id: 'jarvis-quantum',
    name: 'Jarvis Quantum Math',
    description: '48-weight Jarvis diffusion mapped to quantum physics operator symbols',
    iconName: 'Cpu',
    config: {
      columns: 140,
      algorithm: 'jarvis',
      palette: 'cyberpunk-neon',
      charset: 'math-quantum',
      colorMode: 'palette-map',
      crtEnabled: true,
      bloomGlow: 0.45,
      contrast: 30
    }
  },
  {
    id: 'burkes-runic',
    name: 'Burkes Rune Occult',
    description: 'Ultra-crisp Burkes error diffusion paired with Norse Elder Futhark runes',
    iconName: 'Sparkles',
    config: {
      columns: 120,
      algorithm: 'burkes',
      palette: 'classic-green',
      charset: 'runic-occult',
      colorMode: 'monochrome',
      crtEnabled: true,
      scanlinesIntensity: 0.4,
      contrast: 35
    }
  },
  {
    id: 'circuit-sierra-lite',
    name: 'Cyber Circuit Matrix',
    description: 'Sierra Lite 2-row diffusion with cyber circuit tech symbols',
    iconName: 'Activity',
    config: {
      columns: 135,
      algorithm: 'sierra-lite',
      palette: 'synthwave',
      charset: 'cyber-circuit',
      colorMode: 'palette-map',
      crtEnabled: true,
      scanlinesIntensity: 0.35,
      contrast: 20
    }
  }
];

export const DEFAULT_DITHER_CONFIG: DitherConfig = {
  columns: 120,
  fontSizeRatio: 0.55,
  algorithm: 'floyd-steinberg',
  palette: 'classic-green',
  charset: 'dense',
  customCharset: ' .:-=+*#%@',
  customFgColor: '#00FF66',
  customBgColor: '#08100A',
  renderMode: 'canvas-ascii',
  
  brightness: 0,
  contrast: 20,
  gamma: 1.0,
  sharpness: 20,
  sobelThreshold: 60,
  ditherStrength: 75,
  invertLuminance: false,
  colorMode: 'monochrome',
  
  crtEnabled: true,
  scanlinesIntensity: 0.25,
  bloomGlow: 0.3,
  flickerAmount: 0.05,
  matrixRainOverlay: false,
  crtCurvature: false,

  playbackRate: 1,
  volume: 0.8,
  muted: false
};
