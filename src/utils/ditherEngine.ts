import { CHARACTER_SETS, PALETTES } from '../data/presets';
import { CharacterSetPreset, DitherConfig, DitherAlgorithm } from '../types/ascii';

// Bayer Matrices normalized
const BAYER_2 = [
  [0, 2],
  [3, 1]
];

const BAYER_4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

const BAYER_8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];

export interface ProcessedFrame {
  grid: string[][];      // Character grid [row][col]
  colorGrid: string[][]; // CSS color string grid [row][col]
  lines: string[];       // Array of row strings
  width: number;
  height: number;
  rawText: string;
}

/**
 * Main ASCII Dither Processing Pipeline
 */
export function processVideoFrame(
  sourceCanvas: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
  config: DitherConfig,
  offscreenCtx: CanvasRenderingContext2D
): ProcessedFrame {
  // Determine input dimensions
  let sourceWidth = 640;
  let sourceHeight = 360;

  if (sourceCanvas instanceof HTMLVideoElement) {
    sourceWidth = sourceCanvas.videoWidth || 640;
    sourceHeight = sourceCanvas.videoHeight || 360;
  } else if (sourceCanvas instanceof HTMLCanvasElement || sourceCanvas instanceof HTMLImageElement) {
    sourceWidth = sourceCanvas.width || 640;
    sourceHeight = sourceCanvas.height || 360;
  }

  const aspectRatio = sourceWidth / sourceHeight;
  const cols = Math.max(20, Math.min(240, config.columns));
  
  // Account for font cell aspect ratio (characters are taller than wide, ~0.5 - 0.65)
  const fontAspect = config.fontSizeRatio || 0.55;
  const rows = Math.max(10, Math.round((cols / aspectRatio) * fontAspect));

  // Resize canvas to processing grid size
  const processingCanvas = offscreenCtx.canvas;
  if (processingCanvas.width !== cols || processingCanvas.height !== rows) {
    processingCanvas.width = cols;
    processingCanvas.height = rows;
  }

  // Draw scaled image to offscreen context
  offscreenCtx.imageSmoothingEnabled = true;
  offscreenCtx.imageSmoothingQuality = 'high';
  
  let imgData: ImageData;
  try {
    offscreenCtx.drawImage(sourceCanvas, 0, 0, cols, rows);
    imgData = offscreenCtx.getImageData(0, 0, cols, rows);
  } catch (err) {
    console.warn("Canvas pixel extraction notice (fallback active):", err);
    imgData = offscreenCtx.createImageData(cols, rows);
  }
  const data = imgData.data;

  // Apply image adjustments (Brightness, Contrast, Gamma, Invert)
  applyImageAdjustments(data, cols, rows, config);

  // Character Set lookup string
  let charsetChars = CHARACTER_SETS.standard.chars;
  if (config.charset === 'custom') {
    charsetChars = config.customCharset || CHARACTER_SETS.standard.chars;
  } else if (CHARACTER_SETS[config.charset as CharacterSetPreset]) {
    charsetChars = CHARACTER_SETS[config.charset as CharacterSetPreset].chars;
  }

  const numLevels = charsetChars.length;

  // Color Palette setup
  const palette = PALETTES[config.palette] || PALETTES['classic-green'];
  const fgColor = config.palette === 'custom' ? config.customFgColor : palette.fg;
  const isTrueColor = config.colorMode === 'true-color' || palette.isTrueColor;
  const isPaletteMap = config.colorMode === 'palette-map' && palette.colors && palette.colors.length > 0;

  const grid: string[][] = Array.from({ length: rows }, () => new Array(cols).fill(' '));
  const colorGrid: string[][] = Array.from({ length: rows }, () => new Array(cols).fill(fgColor));

  // Special Mode: Braille 2x4 Dot Matrix
  if (config.charset === 'braille') {
    processBrailleGrid(sourceCanvas, cols, rows, config, grid, colorGrid, palette, isTrueColor);
    const lines = grid.map(row => row.join(''));
    return {
      grid,
      colorGrid,
      lines,
      width: cols,
      height: rows,
      rawText: lines.join('\n')
    };
  }

  // Special Mode: Sobel Edge Contour Detection
  if (config.algorithm === 'sobel') {
    processSobelGrid(data, cols, rows, config, charsetChars, grid, colorGrid, palette, fgColor, isTrueColor, isPaletteMap);
    const lines = grid.map(row => row.join(''));
    return {
      grid,
      colorGrid,
      lines,
      width: cols,
      height: rows,
      rawText: lines.join('\n')
    };
  }

  // Luminance Matrix [y][x]
  const gray: number[][] = Array.from({ length: rows }, () => new Float32Array(cols) as unknown as number[]);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      // Standard perceived luminance formula (ITU-R BT.601)
      let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      
      if (config.invertLuminance) {
        lum = 1.0 - lum;
      }
      gray[y][x] = Math.max(0, Math.min(1, lum));
    }
  }

  // Apply Selected Dithering Algorithm
  const dithered = applyDithering(gray, cols, rows, config.algorithm, config.ditherStrength / 100);

  // Map dithered values to characters and colors
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const val = Math.max(0, Math.min(1, dithered[y][x]));
      const charIndex = Math.min(numLevels - 1, Math.floor(val * numLevels));
      const char = charsetChars[charIndex] || ' ';
      grid[y][x] = char;

      const idx = (y * cols + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      if (isTrueColor) {
        colorGrid[y][x] = `rgb(${r}, ${g}, ${b})`;
      } else if (isPaletteMap && palette.colors) {
        const palIndex = Math.min(palette.colors.length - 1, Math.floor(val * palette.colors.length));
        colorGrid[y][x] = palette.colors[palIndex];
      } else {
        colorGrid[y][x] = fgColor;
      }
    }
  }

  const lines = grid.map(row => row.join(''));

  return {
    grid,
    colorGrid,
    lines,
    width: cols,
    height: rows,
    rawText: lines.join('\n')
  };
}

/**
 * Image adjustment preprocessing (Brightness, Contrast, Gamma)
 */
function applyImageAdjustments(
  data: Uint8ClampedArray,
  cols: number,
  rows: number,
  config: DitherConfig
) {
  const contrastFactor = (259 * (config.contrast + 255)) / (255 * (259 - config.contrast));
  const brightnessOffset = config.brightness * 2.55;
  const gammaInv = 1.0 / (config.gamma || 1.0);

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Contrast
    r = contrastFactor * (r - 128) + 128;
    g = contrastFactor * (g - 128) + 128;
    b = contrastFactor * (b - 128) + 128;

    // Brightness
    r += brightnessOffset;
    g += brightnessOffset;
    b += brightnessOffset;

    // Gamma
    if (config.gamma !== 1.0) {
      r = 255 * Math.pow(Math.max(0, r) / 255, gammaInv);
      g = 255 * Math.pow(Math.max(0, g) / 255, gammaInv);
      b = 255 * Math.pow(Math.max(0, b) / 255, gammaInv);
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
}

/**
 * Core Dithering Algorithms Execution
 */
function applyDithering(
  gray: number[][],
  cols: number,
  rows: number,
  algorithm: DitherAlgorithm,
  strength: number
): number[][] {
  const output: number[][] = Array.from({ length: rows }, (_, y) => Array.from(gray[y]));

  if (algorithm === 'threshold') {
    return output;
  }

  // Bayer & Cluster-Dot Ordered Dithering
  if (algorithm.startsWith('bayer-') || algorithm === 'cluster-dot') {
    let matrix = BAYER_4;
    let size = 4;
    if (algorithm === 'bayer-2') {
      matrix = BAYER_2;
      size = 2;
    } else if (algorithm === 'bayer-8') {
      matrix = BAYER_8;
      size = 8;
    } else if (algorithm === 'cluster-dot') {
      matrix = [
        [12, 5, 6, 13],
        [4, 0, 1, 7],
        [11, 3, 2, 8],
        [15, 10, 9, 14]
      ];
      size = 4;
    }

    const divisor = size * size;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const threshold = (matrix[y % size][x % size] / divisor - 0.5) * strength * 0.5;
        output[y][x] = Math.max(0, Math.min(1, output[y][x] + threshold));
      }
    }
    return output;
  }

  // Random Filmic Noise Dither
  if (algorithm === 'noise') {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const noise = (Math.random() - 0.5) * strength * 0.4;
        output[y][x] = Math.max(0, Math.min(1, output[y][x] + noise));
      }
    }
    return output;
  }

  // Halftone Dot Matrix
  if (algorithm === 'halftone') {
    const scale = 4;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = (x % scale) - scale / 2;
        const cy = (y % scale) - scale / 2;
        const dist = Math.sqrt(cx * cx + cy * cy) / (scale / 1.414);
        const factor = (1.0 - dist) * strength * 0.3;
        output[y][x] = Math.max(0, Math.min(1, output[y][x] + factor));
      }
    }
    return output;
  }

  // Error Diffusion Algorithms (Floyd-Steinberg, Atkinson, Stucki)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const oldVal = output[y][x];
      // Quantize to nearest step
      const quantized = Math.round(oldVal * 8) / 8;
      const error = (oldVal - quantized) * strength;
      output[y][x] = quantized;

      if (algorithm === 'floyd-steinberg') {
        if (x + 1 < cols) output[y][x + 1] += error * (7 / 16);
        if (y + 1 < rows) {
          if (x > 0) output[y + 1][x - 1] += error * (3 / 16);
          output[y + 1][x] += error * (5 / 16);
          if (x + 1 < cols) output[y + 1][x + 1] += error * (1 / 16);
        }
      } else if (algorithm === 'atkinson') {
        const e = error / 8;
        if (x + 1 < cols) output[y][x + 1] += e;
        if (x + 2 < cols) output[y][x + 2] += e;
        if (y + 1 < rows) {
          if (x > 0) output[y + 1][x - 1] += e;
          output[y + 1][x] += e;
          if (x + 1 < cols) output[y + 1][x + 1] += e;
        }
        if (y + 2 < rows) {
          output[y + 2][x] += e;
        }
      } else if (algorithm === 'stucki') {
        const e = error / 42;
        if (x + 1 < cols) output[y][x + 1] += e * 8;
        if (x + 2 < cols) output[y][x + 2] += e * 4;
        if (y + 1 < rows) {
          if (x - 2 >= 0) output[y + 1][x - 2] += e * 2;
          if (x - 1 >= 0) output[y + 1][x - 1] += e * 4;
          output[y + 1][x] += e * 8;
          if (x + 1 < cols) output[y + 1][x + 1] += e * 4;
          if (x + 2 < cols) output[y + 1][x + 2] += e * 2;
        }
      } else if (algorithm === 'sierra') {
        // Sierra 3-Row Error Diffusion (divisor 32)
        const e = error / 32;
        if (x + 1 < cols) output[y][x + 1] += e * 5;
        if (x + 2 < cols) output[y][x + 2] += e * 3;
        if (y + 1 < rows) {
          if (x - 2 >= 0) output[y + 1][x - 2] += e * 2;
          if (x - 1 >= 0) output[y + 1][x - 1] += e * 4;
          output[y + 1][x] += e * 5;
          if (x + 1 < cols) output[y + 1][x + 1] += e * 4;
          if (x + 2 < cols) output[y + 1][x + 2] += e * 2;
        }
        if (y + 2 < rows) {
          if (x - 1 >= 0) output[y + 2][x - 1] += e * 2;
          output[y + 2][x] += e * 3;
          if (x + 1 < cols) output[y + 2][x + 1] += e * 2;
        }
      } else if (algorithm === 'sierra-lite') {
        // Sierra Lite 2-Row (divisor 4)
        const e = error / 4;
        if (x + 1 < cols) output[y][x + 1] += e * 2;
        if (y + 1 < rows) {
          if (x - 1 >= 0) output[y + 1][x - 1] += e * 1;
          output[y + 1][x] += e * 1;
        }
      } else if (algorithm === 'jarvis') {
        // Jarvis, Judice & Ninke 3-Row (divisor 48)
        const e = error / 48;
        if (x + 1 < cols) output[y][x + 1] += e * 7;
        if (x + 2 < cols) output[y][x + 2] += e * 5;
        if (y + 1 < rows) {
          if (x - 2 >= 0) output[y + 1][x - 2] += e * 3;
          if (x - 1 >= 0) output[y + 1][x - 1] += e * 5;
          output[y + 1][x] += e * 7;
          if (x + 1 < cols) output[y + 1][x + 1] += e * 5;
          if (x + 2 < cols) output[y + 1][x + 2] += e * 3;
        }
        if (y + 2 < rows) {
          if (x - 2 >= 0) output[y + 2][x - 2] += e * 1;
          if (x - 1 >= 0) output[y + 2][x - 1] += e * 3;
          output[y + 2][x] += e * 5;
          if (x + 1 < cols) output[y + 2][x + 1] += e * 3;
          if (x + 2 < cols) output[y + 2][x + 2] += e * 1;
        }
      } else if (algorithm === 'burkes') {
        // Burkes Error Diffusion (divisor 32)
        const e = error / 32;
        if (x + 1 < cols) output[y][x + 1] += e * 8;
        if (x + 2 < cols) output[y][x + 2] += e * 4;
        if (y + 1 < rows) {
          if (x - 2 >= 0) output[y + 1][x - 2] += e * 2;
          if (x - 1 >= 0) output[y + 1][x - 1] += e * 4;
          output[y + 1][x] += e * 8;
          if (x + 1 < cols) output[y + 1][x + 1] += e * 4;
          if (x + 2 < cols) output[y + 1][x + 2] += e * 2;
        }
      }
    }
  }

  return output;
}

/**
 * Sobel Edge Detection Grid Generator
 */
function processSobelGrid(
  data: Uint8ClampedArray,
  cols: number,
  rows: number,
  config: DitherConfig,
  charsetChars: string,
  grid: string[][],
  colorGrid: string[][],
  palette: any,
  fgColor: string,
  isTrueColor: boolean,
  isPaletteMap: boolean
) {
  const threshold = config.sobelThreshold || 60;
  const edgeChars = [' ', '·', '-', '/', '|', '\\', '+', '#', '█'];

  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      // Get 3x3 luminance values
      let gx = 0;
      let gy = 0;

      const getLum = (cx: number, cy: number) => {
        const idx = (cy * cols + cx) * 4;
        return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      };

      const p00 = getLum(x - 1, y - 1);
      const p01 = getLum(x, y - 1);
      const p02 = getLum(x + 1, y - 1);

      const p10 = getLum(x - 1, y);
      const p12 = getLum(x + 1, y);

      const p20 = getLum(x - 1, y + 1);
      const p21 = getLum(x, y + 1);
      const p22 = getLum(x + 1, y + 1);

      // Sobel Kernels
      gx = (p02 + 2 * p12 + p22) - (p00 + 2 * p10 + p20);
      gy = (p20 + 2 * p21 + p22) - (p00 + 2 * p01 + p02);

      const magnitude = Math.sqrt(gx * gx + gy * gy);

      if (magnitude > threshold) {
        // Calculate edge orientation angle
        const angle = Math.atan2(gy, gx) * (180 / Math.PI);
        let edgeChar = '#';

        if ((angle >= -22.5 && angle < 22.5) || angle >= 157.5 || angle < -157.5) {
          edgeChar = '|';
        } else if ((angle >= 22.5 && angle < 67.5) || (angle >= -157.5 && angle < -112.5)) {
          edgeChar = '/';
        } else if ((angle >= 67.5 && angle < 112.5) || (angle >= -112.5 && angle < -67.5)) {
          edgeChar = '-';
        } else {
          edgeChar = '\\';
        }

        grid[y][x] = edgeChar;

        const idx = (y * cols + x) * 4;
        if (isTrueColor) {
          colorGrid[y][x] = `rgb(${data[idx]}, ${data[idx + 1]}, ${data[idx + 2]})`;
        } else if (isPaletteMap && palette.colors) {
          colorGrid[y][x] = palette.colors[palette.colors.length - 1];
        } else {
          colorGrid[y][x] = fgColor;
        }
      } else {
        grid[y][x] = ' ';
        colorGrid[y][x] = palette.bg;
      }
    }
  }
}

/**
 * Ultra-HD Braille 2x4 Sub-pixel Matrix Processor
 */
function processBrailleGrid(
  source: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement,
  cols: number,
  rows: number,
  config: DitherConfig,
  grid: string[][],
  colorGrid: string[][],
  palette: any,
  isTrueColor: boolean
) {
  // Create high-res 2x4 canvas
  const subCols = cols * 2;
  const subRows = rows * 4;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = subCols;
  tempCanvas.height = subRows;
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return;

  let imgData: ImageData;
  try {
    tempCtx.drawImage(source, 0, 0, subCols, subRows);
    imgData = tempCtx.getImageData(0, 0, subCols, subRows);
  } catch (err) {
    console.warn("Braille canvas extraction notice (fallback active):", err);
    imgData = tempCtx.createImageData(subCols, subRows);
  }
  const data = imgData.data;

  // Threshold / Luminance map
  const dotThreshold = 120 + config.brightness * 1.5;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let brailleCode = 0x2800; // Base Braille empty char
      let avgR = 0, avgG = 0, avgB = 0;
      let activeDots = 0;

      // Check 2x4 sub-pixel grid inside cell
      for (let dy = 0; dy < 4; dy++) {
        for (let dx = 0; dx < 2; dx++) {
          const px = x * 2 + dx;
          const py = y * 4 + dy;
          const idx = (py * subCols + px) * 4;

          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          const isDotOn = config.invertLuminance ? lum < dotThreshold : lum > dotThreshold;

          if (isDotOn) {
            // Braille dot offset bit mapping
            let dotBit = 0;
            if (dx === 0 && dy === 0) dotBit = 0x01; // Dot 1
            if (dx === 0 && dy === 1) dotBit = 0x02; // Dot 2
            if (dx === 0 && dy === 2) dotBit = 0x04; // Dot 3
            if (dx === 1 && dy === 0) dotBit = 0x08; // Dot 4
            if (dx === 1 && dy === 1) dotBit = 0x10; // Dot 5
            if (dx === 1 && dy === 2) dotBit = 0x20; // Dot 6
            if (dx === 0 && dy === 3) dotBit = 0x40; // Dot 7
            if (dx === 1 && dy === 3) dotBit = 0x80; // Dot 8

            brailleCode |= dotBit;
            avgR += r;
            avgG += g;
            avgB += b;
            activeDots++;
          }
        }
      }

      grid[y][x] = String.fromCharCode(brailleCode);

      if (activeDots > 0) {
        avgR = Math.round(avgR / activeDots);
        avgG = Math.round(avgG / activeDots);
        avgB = Math.round(avgB / activeDots);
      }

      if (isTrueColor) {
        colorGrid[y][x] = `rgb(${avgR}, ${avgG}, ${avgB})`;
      } else {
        colorGrid[y][x] = palette.fg;
      }
    }
  }
}
