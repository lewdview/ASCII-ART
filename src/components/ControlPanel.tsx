import React, { useState } from 'react';
import {
  Sliders, Grid, Palette, Cpu, Tv, Eye, Sparkles, RefreshCw, Type, Sun, Contrast, Activity, Zap
} from 'lucide-react';
import { CharacterSetPreset, DitherAlgorithm, DitherConfig, PalettePreset } from '../types/ascii';
import { CHARACTER_SETS, PALETTES } from '../data/presets';

interface ControlPanelProps {
  config: DitherConfig;
  onChange: (updates: Partial<DitherConfig>) => void;
  onResetDefaults: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChange,
  onResetDefaults
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'dither' | 'palette' | 'tuning' | 'crt'>('grid');

  return (
    <aside className="w-full lg:w-96 bg-zinc-950 border-l border-zinc-800/80 flex flex-col h-full overflow-hidden text-zinc-200">
      {/* Panel Header & Reset */}
      <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="font-mono font-bold text-sm text-zinc-100">DITHER STUDIO CONTROLS</h2>
        </div>
        <button
          onClick={onResetDefaults}
          className="text-xs font-mono text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
          title="Reset controls to default configuration"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center border-b border-zinc-800/80 bg-zinc-900/30 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('grid')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer min-w-max ${
            activeTab === 'grid'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Grid</span>
        </button>

        <button
          onClick={() => setActiveTab('dither')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer min-w-max ${
            activeTab === 'dither'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Dither</span>
        </button>

        <button
          onClick={() => setActiveTab('palette')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer min-w-max ${
            activeTab === 'palette'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Palette</span>
        </button>

        <button
          onClick={() => setActiveTab('tuning')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer min-w-max ${
            activeTab === 'tuning'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Contrast className="w-3.5 h-3.5" />
          <span>Tuning</span>
        </button>

        <button
          onClick={() => setActiveTab('crt')}
          className={`flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer min-w-max ${
            activeTab === 'crt'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10 font-bold'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>CRT FX</span>
        </button>
      </div>

      {/* Control Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* TAB 1: GRID & CHARACTERS */}
        {activeTab === 'grid' && (
          <div className="space-y-5">
            {/* Columns Resolution */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <label className="text-zinc-300 font-medium">ASCII Resolution (Columns)</label>
                <span className="text-emerald-400 font-bold">{config.columns} cols</span>
              </div>
              <input
                type="range"
                min="30"
                max="240"
                step="5"
                value={config.columns}
                onChange={(e) => onChange({ columns: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>30 (Retro Coarse)</span>
                <span>120 (Standard)</span>
                <span>240 (Ultra HD)</span>
              </div>
            </div>

            {/* Character Set Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-300 font-medium block">
                Character Density Set
              </label>
              <div className="grid grid-cols-1 gap-2">
                {(Object.keys(CHARACTER_SETS) as CharacterSetPreset[]).map((key) => {
                  const set = CHARACTER_SETS[key];
                  const isSelected = config.charset === key;

                  return (
                    <button
                      key={key}
                      onClick={() => onChange({ charset: key })}
                      className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 font-semibold shadow-sm'
                          : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold">{set.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-1.5 py-0.5 rounded">
                          {key === 'braille' ? '2x4 Dots' : set.chars.substring(0, 8)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{set.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Charset Text Input if custom selected */}
            {config.charset === 'custom' && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <label className="text-xs font-mono text-zinc-300 font-medium block">
                  Custom Character Sequence (Dark → Light)
                </label>
                <input
                  type="text"
                  value={config.customCharset}
                  onChange={(e) => onChange({ customCharset: e.target.value })}
                  placeholder=" .:-=+*#%@"
                  className="w-full bg-zinc-900 border border-zinc-700 text-xs font-mono text-emerald-400 px-3 py-2 rounded-lg outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Invert Luminance Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div>
                <span className="text-xs font-mono text-zinc-200 font-medium block">Invert Luminance</span>
                <span className="text-[11px] font-mono text-zinc-400">Swap bright and dark character mapping</span>
              </div>
              <input
                type="checkbox"
                checked={config.invertLuminance}
                onChange={(e) => onChange({ invertLuminance: e.target.checked })}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DITHER ENGINE */}
        {activeTab === 'dither' && (
          <div className="space-y-5">
            {/* Dither Algorithm Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-300 font-medium block">
                Dithering Algorithm
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'floyd-steinberg', name: 'Floyd-Steinberg', desc: 'Classic smooth error diffusion' },
                  { id: 'atkinson', name: 'Atkinson', desc: 'Mac Classic high-contrast' },
                  { id: 'sierra', name: 'Sierra 3-Row', desc: '3-row balanced filmic diffusion' },
                  { id: 'sierra-lite', name: 'Sierra Lite', desc: 'Fast 2-row light diffusion' },
                  { id: 'jarvis', name: 'Jarvis Judice', desc: '48-weight rich detailed diffusion' },
                  { id: 'burkes', name: 'Burkes Filter', desc: 'Crisp 32-weight error diffusion' },
                  { id: 'stucki', name: 'Stucki Filter', desc: '42-weight sharp edge diffusion' },
                  { id: 'bayer-4', name: 'Bayer 4x4', desc: 'Ordered cross-hatch matrix' },
                  { id: 'bayer-8', name: 'Bayer 8x8', desc: 'Fine 64-level grid matrix' },
                  { id: 'cluster-dot', name: 'Cluster Dot', desc: '4x4 clustered press print matrix' },
                  { id: 'halftone', name: 'Halftone Dot', desc: 'Screen printing dot pattern' },
                  { id: 'sobel', name: 'Sobel Contour', desc: 'Holographic edge detection' },
                  { id: 'noise', name: 'Noise Dither', desc: 'Filmic grainy jitter' },
                  { id: 'threshold', name: 'Threshold', desc: 'Posterized hard cutoff' }
                ].map((algo) => (
                  <button
                    key={algo.id}
                    onClick={() => onChange({ algorithm: algo.id as DitherAlgorithm })}
                    className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
                      config.algorithm === algo.id
                        ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 font-semibold shadow-sm'
                        : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div className="font-bold">{algo.name}</div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{algo.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dither Strength Matrix Slider */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="flex justify-between text-xs font-mono">
                <label className="text-zinc-300 font-medium">Dither Diffusion Intensity</label>
                <span className="text-emerald-400 font-bold">{config.ditherStrength}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={config.ditherStrength}
                onChange={(e) => onChange({ ditherStrength: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Sobel Threshold if Sobel selected */}
            {config.algorithm === 'sobel' && (
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-xs font-mono">
                  <label className="text-zinc-300 font-medium">Sobel Edge Threshold</label>
                  <span className="text-emerald-400 font-bold">{config.sobelThreshold}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="180"
                  value={config.sobelThreshold}
                  onChange={(e) => onChange({ sobelThreshold: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PALETTE & COLOR */}
        {activeTab === 'palette' && (
          <div className="space-y-5">
            {/* Palette Selection Grid */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-zinc-300 font-medium block">
                Color Palette & Terminal Themes
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(PALETTES) as PalettePreset[]).map((key) => {
                  const pal = PALETTES[key];
                  const isSelected = config.palette === key;

                  return (
                    <button
                      key={key}
                      onClick={() => onChange({ palette: key })}
                      className={`p-2.5 rounded-lg border text-left text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 font-semibold shadow-sm'
                          : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{pal.name}</span>
                        <div className="flex items-center gap-1">
                          <span
                            className="w-3 h-3 rounded-full border border-zinc-700"
                            style={{ backgroundColor: pal.bg }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-zinc-700"
                            style={{ backgroundColor: pal.fg }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Mode Selection */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <label className="text-xs font-mono text-zinc-300 font-medium block">Color Mode</label>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                {[
                  { id: 'monochrome', label: 'Mono' },
                  { id: 'palette-map', label: 'Palette Map' },
                  { id: 'true-color', label: 'True RGB' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => onChange({ colorMode: mode.id as any })}
                    className={`py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                      config.colorMode === mode.id
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Palette Color Pickers */}
            {config.palette === 'custom' && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-xs font-mono text-zinc-300 block mb-1">Foreground</label>
                  <input
                    type="color"
                    value={config.customFgColor}
                    onChange={(e) => onChange({ customFgColor: e.target.value })}
                    className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-300 block mb-1">Background</label>
                  <input
                    type="color"
                    value={config.customBgColor}
                    onChange={(e) => onChange({ customBgColor: e.target.value })}
                    className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PICTURE TUNING */}
        {activeTab === 'tuning' && (
          <div className="space-y-5">
            {/* Contrast */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <label className="text-zinc-300 font-medium">Contrast</label>
                <span className="text-emerald-400 font-bold">{config.contrast}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={config.contrast}
                onChange={(e) => onChange({ contrast: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Brightness */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <label className="text-zinc-300 font-medium">Brightness</label>
                <span className="text-emerald-400 font-bold">{config.brightness}</span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={config.brightness}
                onChange={(e) => onChange({ brightness: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Gamma */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <label className="text-zinc-300 font-medium">Gamma Curve</label>
                <span className="text-emerald-400 font-bold">{config.gamma}</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={config.gamma}
                onChange={(e) => onChange({ gamma: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        )}

        {/* TAB 5: CRT & RETRO FX */}
        {activeTab === 'crt' && (
          <div className="space-y-5">
            {/* CRT Master Toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div>
                <span className="text-xs font-mono text-zinc-200 font-medium block">CRT Monitor Simulation</span>
                <span className="text-[11px] font-mono text-zinc-400">Scanlines, glass curvature, & glow</span>
              </div>
              <input
                type="checkbox"
                checked={config.crtEnabled}
                onChange={(e) => onChange({ crtEnabled: e.target.checked })}
                className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            {config.crtEnabled && (
              <>
                {/* Scanlines Intensity */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <label className="text-zinc-300 font-medium">Scanlines Intensity</label>
                    <span className="text-emerald-400 font-bold">{Math.round(config.scanlinesIntensity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.scanlinesIntensity}
                    onChange={(e) => onChange({ scanlinesIntensity: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Phosphor Bloom Glow */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <label className="text-zinc-300 font-medium">Phosphor Bloom / Glow</label>
                    <span className="text-emerald-400 font-bold">{Math.round(config.bloomGlow * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.bloomGlow}
                    onChange={(e) => onChange({ bloomGlow: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Matrix Code Rain Overlay Toggle */}
                <div className="flex items-center justify-between p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-medium block">Matrix Code Rain Overlay</span>
                    <span className="text-[11px] font-mono text-zinc-400">Falling digital stream behind ASCII video</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.matrixRainOverlay}
                    onChange={(e) => onChange({ matrixRainOverlay: e.target.checked })}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
