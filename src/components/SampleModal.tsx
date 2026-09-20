import React, { useEffect, useState } from 'react';
import { X, Play, Film, Sparkles, Youtube, Check } from 'lucide-react';
import { VideoSourceMeta } from '../types/ascii';

interface SampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample: (sample: any) => void;
  activeSampleId?: string;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
  activeSampleId
}) => {
  const [samples, setSamples] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetch('/api/samples')
        .then((res) => res.json())
        .then((data) => {
          setSamples(data);
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl text-zinc-100">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-emerald-400" />
            <h2 className="font-mono font-bold text-base">Curated YouTube & Video Sample Gallery</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <p className="text-xs font-mono text-zinc-400 mb-6">
            Test ASCII Dither Magic with iconic high-contrast YouTube video clips optimized for ASCII animation.
          </p>

          {isLoading ? (
            <div className="py-12 text-center font-mono text-xs text-zinc-500 animate-pulse">
              Loading YouTube sample gallery...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {samples.map((sample) => {
                const isSelected = activeSampleId === sample.id;

                return (
                  <div
                    key={sample.id}
                    onClick={() => {
                      onSelectSample(sample);
                      onClose();
                    }}
                    className={`group border rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col bg-zinc-900/60 hover:bg-zinc-900 ${
                      isSelected
                        ? 'border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative aspect-video bg-zinc-950 overflow-hidden">
                      <img
                        src={sample.thumbnail}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          {isSelected ? <Check className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono text-zinc-300 rounded">
                        {sample.duration}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <h3 className="font-mono text-xs font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {sample.title}
                        </h3>
                        <p className="text-[11px] font-mono text-zinc-400">{sample.channel}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {sample.tags?.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
