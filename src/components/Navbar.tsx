import React, { useState } from 'react';
import { Terminal, Youtube, Upload, Camera, Film, Sparkles, Download, Play, Info, Loader2 } from 'lucide-react';
import { SourceType, VideoSourceMeta, YouTubeConversionState } from '../types/ascii';

interface NavbarProps {
  currentSource: VideoSourceMeta;
  onSelectYouTubeUrl: (url: string) => void;
  onOpenSamples: () => void;
  onOpenUpload: () => void;
  onToggleWebcam: () => void;
  onOpenExport: () => void;
  isWebcamActive: boolean;
  ytConversion?: YouTubeConversionState;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentSource,
  onSelectYouTubeUrl,
  onOpenSamples,
  onOpenUpload,
  onToggleWebcam,
  onOpenExport,
  isWebcamActive,
  ytConversion
}) => {
  const [ytInput, setYtInput] = useState('');

  const isConverting = ytConversion?.isConverting ?? false;
  const progress = ytConversion?.progress ?? 0;

  const handleYtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytInput.trim() || isConverting) return;
    onSelectYouTubeUrl(ytInput.trim());
  };

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-3 sticky top-0 z-40 text-zinc-100">
      <div className="max-w-[1800px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-zinc-950 rounded-[7px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500 bg-clip-text text-transparent">
                ASCII<span className="text-emerald-400">.MAGIC</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 animate-pulse" /> DITHER STUDIO
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono hidden sm:block">
              YouTube & Video to Animated Dither ASCII
            </p>
          </div>
        </div>

        {/* YouTube Input Box & Quick Convert Pills */}
        <div className="flex-1 max-w-xl mx-2 min-w-[280px] flex flex-col gap-1">
          <form onSubmit={handleYtSubmit} className="relative flex items-center overflow-hidden rounded-lg">
            <div className="absolute left-3 text-red-500 pointer-events-none z-10">
              <Youtube className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={ytInput}
              onChange={(e) => setYtInput(e.target.value)}
              placeholder="Paste YouTube Video URL (e.g., https://www.youtube.com/watch?v=...)"
              className="w-full bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-600 focus:border-emerald-500 text-xs font-mono text-zinc-200 pl-9 pr-24 py-1.5 rounded-lg outline-none transition-all placeholder:text-zinc-500"
            />

            {/* Glowing progress line on form border when converting */}
            {isConverting && (
              <div
                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 transition-all duration-300 z-20"
                style={{ width: `${progress}%` }}
              />
            )}

            <button
              type="submit"
              disabled={isConverting || !ytInput.trim()}
              className="absolute right-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-xs font-mono font-medium text-zinc-950 rounded-md transition-all flex items-center gap-1.5 cursor-pointer z-10"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-zinc-950" />
                  <span>{progress}%</span>
                </>
              ) : (
                'Convert'
              )}
            </button>
          </form>

          {/* Real-time YouTube Conversion Progress Bar Banner */}
          {isConverting && (
            <div className="flex items-center gap-2 bg-zinc-900/90 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-[11px] font-mono text-emerald-300 animate-fadeIn">
              <Loader2 className="w-3 h-3 animate-spin text-emerald-400 shrink-0" />
              <div className="flex-1 overflow-hidden truncate">
                <span className="text-zinc-400">Converting:</span>{' '}
                <span className="text-zinc-200 font-semibold">{ytConversion?.statusText || 'Processing stream...'}</span>
              </div>
              <div className="w-20 bg-zinc-800 rounded-full h-1.5 overflow-hidden shrink-0">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="font-bold text-emerald-400 shrink-0">{progress}%</span>
            </div>
          )}

          {/* Quick YouTube Convert Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono text-zinc-400 no-scrollbar py-0.5">
            <span className="text-zinc-500 flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Quick Convert:
            </span>
            {[
              { label: 'Bad Apple!!', url: 'https://www.youtube.com/watch?v=FtutLA63Cp8' },
              { label: 'Matrix Rain', url: 'https://www.youtube.com/watch?v=mqy8gCllp30' },
              { label: 'Synthwave Neon', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
              { label: 'Rick Roll', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
              { label: 'Lofi Girl', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' }
            ].map((chip) => (
              <button
                key={chip.label}
                type="button"
                disabled={isConverting}
                onClick={() => {
                  setYtInput(chip.url);
                  onSelectYouTubeUrl(chip.url);
                }}
                className="px-2 py-0.5 rounded-full bg-zinc-900 hover:bg-emerald-950/80 border border-zinc-800 hover:border-emerald-500/50 text-zinc-300 hover:text-emerald-300 transition-colors shrink-0 cursor-pointer flex items-center gap-1 disabled:opacity-50"
              >
                <Youtube className="w-2.5 h-2.5 text-red-400" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Source Controls & Actions */}
        <div className="flex items-center gap-2">
          {/* Sample Videos Button */}
          <button
            onClick={onOpenSamples}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-300 hover:text-emerald-400 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Choose from curated YouTube video samples"
          >
            <Film className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Samples</span>
          </button>

          {/* File Upload Button */}
          <button
            onClick={onOpenUpload}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-300 hover:text-emerald-400 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Upload local video file (.mp4, .webm, .gif)"
          >
            <Upload className="w-4 h-4 text-teal-400" />
            <span className="hidden md:inline">Upload</span>
          </button>

          {/* Webcam Button */}
          <button
            onClick={onToggleWebcam}
            className={`px-3 py-1.5 border rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              isWebcamActive
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-700/70 text-zinc-300 hover:text-emerald-400'
            }`}
            title="Toggle live camera ASCII feed"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">{isWebcamActive ? 'Stop Cam' : 'Webcam'}</span>
          </button>

          {/* Export / Record Action */}
          <button
            onClick={onOpenExport}
            className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-mono font-bold text-xs rounded-lg shadow-md shadow-emerald-950/50 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export ASCII</span>
          </button>
        </div>
      </div>
    </header>
  );
};
