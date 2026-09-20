import React, { useState } from 'react';
import { X, Download, Video, FileText, Image as ImageIcon, Copy, Check, Code, Disc } from 'lucide-react';
import { CanvasVideoRecorder, copyASCIIToClipboard, downloadCanvasPNG, downloadASCIIText } from '../utils/recorder';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: HTMLCanvasElement | null;
  rawAsciiText?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  rawAsciiText
}) => {
  const [recorder] = useState(() => new CanvasVideoRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const handleStartRecord = () => {
    if (!canvasRef) return;
    const ok = recorder.start(canvasRef, 30);
    if (ok) {
      setIsRecording(true);
      setRecordSeconds(0);
      setRecordedVideoUrl(null);

      const interval = setInterval(() => {
        setRecordSeconds((prev) => {
          if (prev >= 15) {
            // Auto stop after 15 seconds max clip
            handleStopRecord();
            clearInterval(interval);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleStopRecord = async () => {
    const blob = await recorder.stop();
    setIsRecording(false);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
    }
  };

  const handleDownloadPNG = () => {
    if (canvasRef) {
      downloadCanvasPNG(canvasRef, `ascii-magic-${Date.now()}.png`);
    }
  };

  const handleDownloadTXT = () => {
    if (rawAsciiText) {
      downloadASCIIText(rawAsciiText, `ascii-magic-frame-${Date.now()}.txt`);
    }
  };

  const handleCopyText = async () => {
    if (rawAsciiText) {
      const ok = await copyASCIIToClipboard(rawAsciiText);
      if (ok) {
        setCopiedText(true);
        setTimeout(() => setCopiedText(false), 2000);
      }
    }
  };

  const generateEmbedHtml = () => {
    const escaped = rawAsciiText ? rawAsciiText.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
    return `<div style="background:#000;color:#00FF66;font-family:monospace;padding:12px;overflow:auto;white-space:pre;font-size:10px;">\n${escaped}\n</div>`;
  };

  const handleCopyEmbedCode = async () => {
    const html = generateEmbedHtml();
    const ok = await copyASCIIToClipboard(html);
    if (ok) {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-zinc-100 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" />
            <h2 className="font-mono font-bold text-base">Export ASCII Animation & Media</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Section 1: Record Video */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <h3 className="font-mono text-xs font-bold text-zinc-200">Record Live WebM / MP4 ASCII Video</h3>
              </div>
              {isRecording && (
                <span className="text-xs font-mono text-rose-400 animate-pulse flex items-center gap-1 font-bold">
                  <Disc className="w-3.5 h-3.5" /> Recording ({recordSeconds}s)
                </span>
              )}
            </div>

            <p className="text-[11px] font-mono text-zinc-400">
              Captures the current dithered ASCII canvas animation at 30 FPS.
            </p>

            <div className="flex items-center gap-3 pt-1">
              {!isRecording ? (
                <button
                  onClick={handleStartRecord}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Video className="w-4 h-4" />
                  <span>Start Recording (Up to 15s)</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecord}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Stop & Save Video</span>
                </button>
              )}

              {recordedVideoUrl && (
                <a
                  href={recordedVideoUrl}
                  download={`ascii-dither-video-${Date.now()}.webm`}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-zinc-950 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Recorded Video</span>
                </a>
              )}
            </div>
          </div>

          {/* Section 2: Snapshots & Text Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PNG Snapshot */}
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-mono text-xs font-bold text-zinc-200">High-Res PNG Snapshot</h4>
                </div>
                <p className="text-[11px] font-mono text-zinc-400">
                  Export single dithered frame with CRT scanlines as PNG image.
                </p>
              </div>

              <button
                onClick={handleDownloadPNG}
                className="mt-3 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
              >
                <Download className="w-4 h-4" />
                <span>Save PNG Image</span>
              </button>
            </div>

            {/* TXT Plain Text File */}
            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h4 className="font-mono text-xs font-bold text-zinc-200">Plain ASCII Text File (.txt)</h4>
                </div>
                <p className="text-[11px] font-mono text-zinc-400">
                  Save current ASCII frame characters as plain text document.
                </p>
              </div>

              <button
                onClick={handleDownloadTXT}
                className="mt-3 w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-zinc-700"
              >
                <Download className="w-4 h-4" />
                <span>Download .TXT File</span>
              </button>
            </div>
          </div>

          {/* Section 3: Clipboard & HTML Embed */}
          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-400" />
              <h4 className="font-mono text-xs font-bold text-zinc-200">Copy ASCII or Embed HTML Code</h4>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyText}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
              >
                {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedText ? 'Copied ASCII Text!' : 'Copy ASCII to Clipboard'}</span>
              </button>

              <button
                onClick={handleCopyEmbedCode}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
              >
                {copiedHtml ? <Check className="w-4 h-4 text-emerald-400" /> : <Code className="w-4 h-4" />}
                <span>{copiedHtml ? 'Copied Embed Code!' : 'Copy HTML Embed Snippet'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
