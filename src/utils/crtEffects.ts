import { ProcessedFrame } from './ditherEngine';
import { DitherConfig, PalettePreset } from '../types/ascii';
import { PALETTES } from '../data/presets';

/**
 * Render Processed ASCII Frame onto target HTML5 Canvas with CRT visual effects
 */
export function renderAsciiToCanvas(
  targetCanvas: HTMLCanvasElement,
  frame: ProcessedFrame,
  config: DitherConfig,
  matrixRainOffset: number
) {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const palette = PALETTES[config.palette] || PALETTES['classic-green'];
  const bgColor = config.palette === 'custom' ? config.customBgColor : palette.bg;
  const fgColor = config.palette === 'custom' ? config.customFgColor : palette.fg;

  const width = targetCanvas.width;
  const height = targetCanvas.height;

  // Clear background
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Calculate cell dimensions
  const cols = frame.width;
  const rows = frame.height;
  const cellWidth = width / cols;
  const cellHeight = height / rows;

  // Configure monospace font
  const fontSize = Math.max(8, Math.floor(cellHeight));
  ctx.font = `${fontSize}px "Courier New", Courier, monospace, "Apple Color Emoji"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Apply Bloom / Glow if enabled
  if (config.crtEnabled && config.bloomGlow > 0) {
    ctx.shadowColor = palette.accent || fgColor;
    ctx.shadowBlur = config.bloomGlow * 12;
  } else {
    ctx.shadowBlur = 0;
  }

  // Draw ASCII grid
  for (let y = 0; y < rows; y++) {
    const rowY = (y + 0.5) * cellHeight;
    for (let x = 0; x < cols; x++) {
      const char = frame.grid[y][x];
      if (char === ' ') continue;

      const colX = (x + 0.5) * cellWidth;
      ctx.fillStyle = frame.colorGrid[y][x];
      ctx.fillText(char, colX, rowY);
    }
  }

  // Draw Optional Matrix Rain Overlay Effect
  if (config.matrixRainOverlay && config.crtEnabled) {
    drawMatrixRainOverlay(ctx, width, height, cellWidth, cellHeight, matrixRainOffset, palette);
  }

  // Draw CRT Scanlines and CRT Curvature Overlay
  if (config.crtEnabled) {
    drawScanlinesAndCRT(ctx, width, height, config);
  }

  ctx.restore();
}

/**
 * Draw Matrix Rain character drops overlay
 */
function drawMatrixRainOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellWidth: number,
  cellHeight: number,
  offset: number,
  palette: any
) {
  const katakana = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789';
  const numCols = Math.floor(width / cellWidth);
  const numRows = Math.floor(height / cellHeight);

  ctx.save();
  ctx.font = `${Math.floor(cellHeight)}px monospace`;

  for (let c = 0; c < numCols; c += 3) {
    const headY = Math.floor(((offset * (c + 3) * 0.7) % (numRows + 10)) - 5);
    const dropLength = 8 + (c % 7);

    for (let r = 0; r < dropLength; r++) {
      const currentY = headY - r;
      if (currentY >= 0 && currentY < numRows) {
        const x = (c + 0.5) * cellWidth;
        const y = (currentY + 0.5) * cellHeight;

        const char = katakana[Math.floor((c + r + offset) % katakana.length)];

        if (r === 0) {
          // Lead glowing character
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#00FF66';
          ctx.shadowBlur = 10;
        } else {
          // Trail green fading
          const alpha = 1.0 - (r / dropLength);
          ctx.fillStyle = `rgba(0, 255, 102, ${alpha * 0.4})`;
          ctx.shadowBlur = 0;
        }

        ctx.fillText(char, x, y);
      }
    }
  }
  ctx.restore();
}

/**
 * Draw CRT Scanlines, Vignette, and Phosphor Flicker
 */
function drawScanlinesAndCRT(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: DitherConfig
) {
  ctx.save();

  // Scanlines Overlay
  if (config.scanlinesIntensity > 0) {
    const lineSpacing = 3;
    const opacity = Math.min(0.8, config.scanlinesIntensity * 0.5);
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;

    for (let y = 0; y < height; y += lineSpacing) {
      ctx.fillRect(0, y, width, 1);
    }
  }

  // CRT Glass Radial Vignette
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, Math.min(width, height) * 0.4,
    width / 2, height / 2, Math.max(width, height) * 0.75
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(0.7, 'rgba(0,0,0,0.2)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.85)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle Flicker Effect
  if (config.flickerAmount > 0 && Math.random() < config.flickerAmount * 0.3) {
    ctx.fillStyle = `rgba(255, 255, 255, ${0.02 + Math.random() * 0.04})`;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}
