import React, { useRef, useState } from 'react';
import { X, Upload, Film, AlertCircle } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectVideoFile: (file: File) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSelectVideoFile
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onSelectVideoFile(file);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onSelectVideoFile(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-zinc-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-400" />
            <h2 className="font-mono font-bold text-base">Upload Video or GIF File</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Drop Area */}
        <div className="p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
              isDragOver
                ? 'border-emerald-500 bg-emerald-500/10 scale-102'
                : 'border-zinc-700 hover:border-emerald-500/60 bg-zinc-900/40 hover:bg-zinc-900/80'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Film className="w-6 h-6" />
            </div>

            <div>
              <p className="font-mono text-sm font-bold text-zinc-200">
                Click or Drag & Drop Video File
              </p>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Supports .MP4, .WEBM, .MOV, .GIF video formats
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-zinc-500 bg-zinc-900/50 p-3 rounded-xl border border-zinc-850">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Uploaded videos are processed 100% locally in your browser for maximum privacy and performance.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
