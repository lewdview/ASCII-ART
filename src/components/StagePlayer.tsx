import React, { useRef, useEffect, useState } from 'react';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2,
  Tv, Eye, Sliders, RefreshCw, Split, Copy, Check, Terminal, Layers,
  Youtube, Sparkles, Loader2, Zap
} from 'lucide-react';
import { DitherConfig, FrameStats, RenderMode, VideoSourceMeta, YouTubeConversionState } from '../types/ascii';
import { ProcessedFrame, processVideoFrame } from '../utils/ditherEngine';
import { renderAsciiToCanvas } from '../utils/crtEffects';
import { copyASCIIToClipboard, downloadASCIIText } from '../utils/recorder';
import { PALETTES } from '../data/presets';

interface StagePlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  videoSource: VideoSourceMeta;
  config: DitherConfig;
  onConfigChange: (newConfig: Partial<DitherConfig>) => void;
  webcamStream: MediaStream | null;
  onCanvasRefReady?: (canvas: HTMLCanvasElement) => void;
  ytConversion?: YouTubeConversionState;
}

// Helper to proxy video URLs through express server for CORS compliance
const getProxyVideoUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('/api/')) {
    return url;
  }
  return `/api/video-proxy?url=${encodeURIComponent(url)}`;
};

export const StagePlayer: React.FC<StagePlayerProps> = ({
  videoRef,
  videoSource,
  config,
  onConfigChange,
  webcamStream,
  onCanvasRefReady,
  ytConversion
}) => {
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback States
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(config.muted);
  const [splitView, setSplitView] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Live Performance Stats
  const [stats, setStats] = useState<FrameStats>({
    fps: 0,
    renderTimeMs: 0,
    cols: config.columns,
    rows: 40,
    totalChars: 0,
    currentFrame: 0
  });

  const [currentFrameData, setCurrentFrameData] = useState<ProcessedFrame | null>(null);

  // Synthetic Video Canvas Generator fallback
  const synthCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animation Loop references
  const animFrameId = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(performance.now());
  const frameCounter = useRef<number>(0);
  const fpsTimer = useRef<number>(performance.now());

  // Setup Offscreen Canvas for Processing
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
  }, []);

  // Pass display canvas reference upward for recorders
  useEffect(() => {
    if (displayCanvasRef.current && onCanvasRefReady) {
      onCanvasRefReady(displayCanvasRef.current);
    }
  }, [displayCanvasRef.current, onCanvasRefReady]);

  // Video Source / Webcam Auto-Play Management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isMounted = true;

    if (webcamStream) {
      video.srcObject = webcamStream;
      video.play().then(() => {
        if (isMounted) setIsPlaying(true);
      }).catch((err) => {
        console.warn('Webcam stream play error:', err);
      });
      return;
    }

    video.srcObject = null;
    const proxiedUrl = getProxyVideoUrl(videoSource.videoUrl);
    if (proxiedUrl && video.src !== proxiedUrl) {
      video.src = proxiedUrl;
    }

    const safePlay = async () => {
      if (!isMounted || !video) return;
      try {
        await video.play();
        if (isMounted) setIsPlaying(true);
      } catch (err) {
        console.warn('Autoplay unmuted blocked by policy or loading, attempting muted play:', err);
        if (isMounted) {
          video.muted = true;
          setIsMuted(true);
          try {
            await video.play();
            if (isMounted) setIsPlaying(true);
          } catch (retryErr) {
            console.warn('Video playback notice (fallback active):', retryErr);
            if (isMounted) setIsPlaying(false);
          }
        }
      }
    };

    if (video.readyState >= 2) {
      safePlay();
    } else {
      const onCanPlay = () => {
        safePlay();
      };
      video.addEventListener('canplay', onCanPlay, { once: true });
      video.addEventListener('loadeddata', onCanPlay, { once: true });
      return () => {
        isMounted = false;
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('loadeddata', onCanPlay);
      };
    }

    return () => {
      isMounted = false;
    };
  }, [videoSource.videoUrl, webcamStream]);

  // Main Realtime Animation & Processing Loop
  useEffect(() => {
    let matrixOffset = 0;

    const renderLoop = () => {
      const video = videoRef.current;
      const displayCanvas = displayCanvasRef.current;
      const offscreenCanvas = offscreenCanvasRef.current;

      if (displayCanvas && offscreenCanvas) {
        const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });

        // Source target selection (Webcam stream video, standard video player, or synthetic fallback)
        let renderSource: HTMLVideoElement | HTMLCanvasElement | null = video;

        const isVideoReady = video && video.videoWidth > 0 && video.readyState >= 2 && !video.error;

        if (!isVideoReady && !webcamStream) {
          if (!synthCanvasRef.current) {
            synthCanvasRef.current = document.createElement('canvas');
            synthCanvasRef.current.width = 640;
            synthCanvasRef.current.height = 360;
          }
          const synthCtx = synthCanvasRef.current.getContext('2d');
          if (synthCtx) {
            const timeSec = performance.now() / 1000;
            const w = 640;
            const h = 360;
            synthCtx.fillStyle = '#050505';
            synthCtx.fillRect(0, 0, w, h);

            // Dynamic high-contrast motion graphic engine
            const cx = w / 2;
            const cy = h / 2;

            for (let i = 0; i < 6; i++) {
              const r = 20 + i * 28 + Math.sin(timeSec * 3 + i) * 18;
              synthCtx.beginPath();
              synthCtx.arc(cx, cy, Math.max(2, r), 0, Math.PI * 2);
              synthCtx.strokeStyle = i % 2 === 0 ? '#ffffff' : '#00ffaa';
              synthCtx.lineWidth = 5 + i * 2;
              synthCtx.stroke();
            }

            // Moving title
            synthCtx.font = 'bold 22px monospace';
            synthCtx.fillStyle = '#ffffff';
            synthCtx.textAlign = 'center';
            synthCtx.fillText(
              (videoSource.title || 'ASCII STREAM').toUpperCase(),
              cx + Math.sin(timeSec * 2) * 15,
              50
            );

            renderSource = synthCanvasRef.current;
          }
        }

        if (renderSource && offscreenCtx) {
          const startTime = performance.now();

          // Process frame through dithering engine
          const processed = processVideoFrame(renderSource, config, offscreenCtx);

          // Update Display Canvas dimensions dynamically
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const targetW = Math.floor(rect.width) || 800;
            const targetH = Math.floor(rect.height) || 450;

            if (displayCanvas.width !== targetW || displayCanvas.height !== targetH) {
              displayCanvas.width = targetW;
              displayCanvas.height = targetH;
            }
          }

          // Render ASCII & CRT effects
          matrixOffset += 0.2;
          renderAsciiToCanvas(displayCanvas, processed, config, matrixOffset);

          const endTime = performance.now();
          const renderMs = endTime - startTime;

          // Track FPS & Stats
          frameCounter.current += 1;
          const now = performance.now();
          if (now - fpsTimer.current >= 500) {
            const elapsed = (now - fpsTimer.current) / 1000;
            const currentFps = Math.round(frameCounter.current / elapsed);
            setStats({
              fps: currentFps,
              renderTimeMs: Math.round(renderMs * 10) / 10,
              cols: processed.width,
              rows: processed.height,
              totalChars: processed.width * processed.height,
              currentFrame: frameCounter.current
            });
            frameCounter.current = 0;
            fpsTimer.current = now;
          }

          if (config.renderMode === 'text-dom') {
            setCurrentFrameData(processed);
          }
        }
      }

      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [config, webcamStream]);

  // Video Time updates
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('Play failed, attempting muted fallback:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        });
      }
    }
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleSpeedChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      onConfigChange({ playbackRate: rate });
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      onConfigChange({ muted: !isMuted });
    }
  };

  const stepFrame = (direction: number) => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      videoRef.current.currentTime += direction * (1 / 30);
    }
  };

  const handleCopyTextFrame = async () => {
    if (currentFrameData) {
      const ok = await copyASCIIToClipboard(currentFrameData.rawText);
      if (ok) {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const palette = PALETTES[config.palette] || PALETTES['classic-green'];

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden relative">
      {/* Offscreen Video element playing source */}
      <video
        ref={videoRef}
        src={getProxyVideoUrl(videoSource.videoUrl)}
        crossOrigin="anonymous"
        loop
        playsInline
        autoPlay
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => {
          if (videoRef.current) {
            videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
          }
        }}
        className="absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
      />

      {/* Main Display Stage Area */}
      <div
        ref={containerRef}
        className={`flex-1 relative flex items-center justify-center bg-black overflow-hidden p-2 md:p-4 ${
          config.crtCurvature ? 'rounded-2xl border-4 border-zinc-800 shadow-2xl' : ''
        }`}
      >
        {/* Render Mode Switcher Bar (Overlaid Top Right) */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-1 rounded-xl shadow-xl">
          <button
            onClick={() => onConfigChange({ renderMode: 'canvas-ascii' })}
            className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              config.renderMode === 'canvas-ascii'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Canvas</span>
          </button>

          <button
            onClick={() => onConfigChange({ renderMode: 'text-dom' })}
            className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              config.renderMode === 'text-dom'
                ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>DOM Text</span>
          </button>

          <button
            onClick={() => setSplitView(!splitView)}
            className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              splitView
                ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Split view: Original video on left vs ASCII Dither Magic on right"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
        </div>

        {/* Live Performance HUD (Top Left) */}
        <div className="absolute top-4 left-4 z-20 font-mono text-[11px] text-emerald-400/80 bg-zinc-950/80 backdrop-blur-md border border-emerald-900/40 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block"></span>
            FPS: <strong className="text-emerald-300 font-bold">{stats.fps}</strong>
          </span>
          <span className="text-zinc-600">|</span>
          <span>Grid: {stats.cols}×{stats.rows}</span>
          <span className="text-zinc-600">|</span>
          <span>Chars: {(stats.totalChars).toLocaleString()}</span>
          <span className="text-zinc-600">|</span>
          <span>{stats.renderTimeMs}ms</span>
        </div>

        {/* Canvas / Video Display Container */}
        <div className="w-full h-full flex items-center justify-center relative overflow-hidden rounded-xl">
          {splitView ? (
            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2">
              {/* Left: Original Video Preview */}
              <div className="relative bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-zinc-950/80 text-[10px] font-mono text-zinc-400 rounded border border-zinc-800">
                  ORIGINAL SOURCE
                </span>
                <video
                  src={videoSource.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Right: Dithered ASCII Canvas */}
              <div className="relative bg-black rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800">
                <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-zinc-950/80 text-[10px] font-mono text-emerald-400 rounded border border-emerald-900/50">
                  DITHER MAGIC ASCII
                </span>
                <canvas ref={displayCanvasRef} className="w-full h-full object-contain" />
              </div>
            </div>
          ) : (
            /* Single ASCII Canvas or DOM Text View */
            config.renderMode === 'text-dom' && currentFrameData ? (
              <div className="w-full h-full overflow-auto p-4 flex items-center justify-center bg-black">
                <pre
                  className="font-mono text-center leading-none select-all"
                  style={{
                    color: palette.fg,
                    backgroundColor: palette.bg,
                    fontSize: `${Math.max(6, Math.floor(10 - config.columns / 25))}px`
                  }}
                >
                  {currentFrameData.rawText}
                </pre>
                <button
                  onClick={handleCopyTextFrame}
                  className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-lg transition-all"
                >
                  {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText ? 'Copied ASCII!' : 'Copy Text'}</span>
                </button>
              </div>
            ) : (
              <canvas ref={displayCanvasRef} className="w-full h-full object-contain cursor-pointer" onClick={togglePlay} />
            )
          )}

          {/* YouTube Conversion HUD Progress Overlay */}
          {ytConversion?.isConverting && (
            <div className="absolute inset-0 z-30 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
              <div className="max-w-md w-full bg-zinc-900/90 border border-emerald-500/50 rounded-2xl p-6 shadow-2xl shadow-emerald-500/10 flex flex-col items-center gap-4 relative overflow-hidden">
                {/* Ambient Background Gradient Glow */}
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Header Badge */}
                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-mono font-semibold">
                  <Youtube className="w-4 h-4 animate-pulse text-red-500" />
                  <span>YOUTUBE ASCII CONVERSION</span>
                </div>

                {/* Thumbnail preview if available */}
                {ytConversion.thumbnailUrl ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-zinc-700/80 group">
                    <img
                      src={ytConversion.thumbnailUrl}
                      alt="YouTube Thumbnail"
                      className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent flex items-end p-3">
                      <p className="text-xs font-mono font-bold text-zinc-100 truncate text-left w-full">
                        {ytConversion.videoTitle || 'YouTube Stream'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}

                {/* Conversion Status Info */}
                <div className="w-full text-left space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                      STATUS: [{ytConversion.stage}]
                    </span>
                    <span className="font-bold text-emerald-400 text-sm">{ytConversion.progress}%</span>
                  </div>

                  {/* Glowing Progress Bar */}
                  <div className="w-full h-2.5 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-emerald-400 rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/50"
                      style={{ width: `${ytConversion.progress}%` }}
                    />
                  </div>

                  <p className="text-[11px] font-mono text-zinc-400 truncate pt-1">
                    {ytConversion.statusText}
                  </p>
                </div>

                {/* Terminal Ticker details */}
                <div className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg p-2.5 font-mono text-[10px] text-zinc-500 text-left space-y-0.5">
                  <div className="flex justify-between">
                    <span>&gt; TARGET_RESOLUTION:</span>
                    <span className="text-emerald-400">{config.columns} COLS x {config.rows || 40} ROWS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; ALGORITHM:</span>
                    <span className="text-teal-300">{config.algorithm.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>&gt; PALETTE:</span>
                    <span className="text-emerald-300">{config.palette.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Timeline & Scrubbing Controls Bar */}
      <div className="bg-zinc-900/95 border-t border-zinc-800/80 px-4 py-2.5 text-zinc-200">
        <div className="max-w-[1800px] mx-auto flex flex-col gap-2">
          {/* Progress Bar Scrubber */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400 min-w-[45px]">
              {formatSeconds(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleScrub}
              className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="text-xs font-mono text-zinc-500 min-w-[45px]">
              {formatSeconds(duration)}
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            {/* Playback buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => stepFrame(-1)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                title="Step 1 frame backward"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => stepFrame(1)}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                title="Step 1 frame forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Volume & Mute */}
              <div className="flex items-center gap-1.5 ml-2 border-l border-zinc-800 pl-3">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Video Meta Info */}
            <div className="text-xs font-mono text-zinc-400 truncate max-w-md hidden md:block">
              <span className="text-zinc-500">Source:</span>{' '}
              <span className="text-emerald-400 font-semibold">{videoSource.title}</span>
            </div>

            {/* Speed & Display Toggles */}
            <div className="flex items-center gap-2">
              {/* Playback speed selector */}
              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
                {[0.5, 1, 1.5, 2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`px-2 py-0.5 text-[11px] font-mono rounded cursor-pointer ${
                      config.playbackRate === rate
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* CRT Curvature Toggle */}
              <button
                onClick={() => onConfigChange({ crtCurvature: !config.crtCurvature })}
                className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                  config.crtCurvature
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                }`}
                title="Toggle CRT Glass Curvature Frame"
              >
                <Tv className="w-4 h-4" />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                title="Fullscreen stage view"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatSeconds(secs: number): string {
  if (isNaN(secs)) return '00:00';
  const mins = Math.floor(secs / 60);
  const remainingSecs = Math.floor(secs % 60);
  return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}
