import React from 'react';
import { MAGIC_STYLE_PRESETS } from '../data/presets';
import { DitherConfig, PresetStyle } from '../types/ascii';
import { Terminal, Gamepad2, Zap, Monitor, Grid, Activity, Tv, FileText, Sparkles } from 'lucide-react';

interface PresetSelectorProps {
  activeConfig: DitherConfig;
  onSelectPreset: (preset: PresetStyle) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Terminal: <Terminal className="w-4 h-4" />,
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Monitor: <Monitor className="w-4 h-4" />,
  Grid: <Grid className="w-4 h-4" />,
  Activity: <Activity className="w-4 h-4" />,
  Tv: <Tv className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />
};

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  activeConfig,
  onSelectPreset
}) => {
  return (
    <div className="bg-zinc-950/80 border-b border-zinc-800/60 px-4 py-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800">
      <div className="max-w-[1800px] mx-auto flex items-center gap-2 min-w-max">
        <div className="flex items-center gap-1 text-xs font-mono text-zinc-400 mr-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider text-[11px] text-zinc-300">1-Click Magic Presets:</span>
        </div>

        <div className="flex items-center gap-2">
          {MAGIC_STYLE_PRESETS.map((preset) => {
            const isMatch =
              activeConfig.palette === preset.config.palette &&
              activeConfig.algorithm === preset.config.algorithm;

            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-emerald-500/15 border-emerald-500/80 text-emerald-300 shadow-sm shadow-emerald-950/40 font-semibold'
                    : 'bg-zinc-900/80 hover:bg-zinc-800/90 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                }`}
                title={preset.description}
              >
                <span className={isMatch ? 'text-emerald-400' : 'text-zinc-400'}>
                  {ICON_MAP[preset.iconName] || <Terminal className="w-4 h-4" />}
                </span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
