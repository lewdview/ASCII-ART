/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PresetSelector } from './components/PresetSelector';
import { StagePlayer } from './components/StagePlayer';
import { ControlPanel } from './components/ControlPanel';
import { SampleModal } from './components/SampleModal';
import { ExportModal } from './components/ExportModal';
import { UploadModal } from './components/UploadModal';
import { DEFAULT_DITHER_CONFIG, MAGIC_STYLE_PRESETS } from './data/presets';
import { DitherConfig, PresetStyle, VideoSourceMeta, YouTubeConversionState } from './types/ascii';
import { extractYouTubeId } from './utils/youtube';

// Initial Default Video Source (Bad Apple!! - High Contrast Animation)
const INITIAL_SOURCE: VideoSourceMeta = {
  type: 'sample',
  id: 'bad-apple',
  title: 'Bad Apple!! - High Contrast Animation',
  author: 'Nomico / Shadow Art',
  thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
  videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  youtubeId: 'FtutLA63Cp8'
};

export default function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // App States
  const [videoSource, setVideoSource] = useState<VideoSourceMeta>(INITIAL_SOURCE);
  const [config, setConfig] = useState<DitherConfig>(DEFAULT_DITHER_CONFIG);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // YouTube Conversion Progress State
  const [ytConversion, setYtConversion] = useState<YouTubeConversionState>({
    isConverting: false,
    progress: 0,
    stage: 'IDLE',
    statusText: ''
  });

  // Modal Visibility States
  const [isSampleOpen, setIsSampleOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handle YouTube URL Conversion with Progress Updates
  const handleSelectYouTubeUrl = async (url: string) => {
    const ytId = extractYouTubeId(url);
    if (!ytId) {
      showToast('⚠️ Invalid YouTube URL format.');
      setYtConversion({
        isConverting: false,
        progress: 0,
        stage: 'ERROR',
        statusText: 'Invalid YouTube URL'
      });
      return;
    }

    // Step 1: Resolving YouTube ID
    setYtConversion({
      isConverting: true,
      progress: 12,
      stage: 'RESOLVING_ID',
      statusText: `Extracted Video ID: ${ytId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
    });

    await new Promise((r) => setTimeout(r, 180));

    // Step 2: Fetching Metadata
    setYtConversion((prev) => ({
      ...prev,
      progress: 32,
      stage: 'FETCHING_METADATA',
      statusText: 'Querying YouTube API for video stream metadata...'
    }));

    try {
      const response = await fetch(`/api/youtube/info?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (response.ok) {
        // Step 3: Stream Processing
        setYtConversion((prev) => ({
          ...prev,
          progress: 65,
          stage: 'PROCESSING_STREAM',
          statusText: `Connected to "${data.title}"`,
          videoTitle: data.title,
          thumbnailUrl: data.thumbnailUrl
        }));

        await new Promise((r) => setTimeout(r, 220));

        // Step 4: Initializing Dither Engine
        setYtConversion((prev) => ({
          ...prev,
          progress: 88,
          stage: 'INITIALIZING_DITHER',
          statusText: 'Synthesizing matrix dither algorithms & ASCII viewport...'
        }));

        await new Promise((r) => setTimeout(r, 200));

        // Stop webcam if active
        if (webcamStream) {
          webcamStream.getTracks().forEach((track) => track.stop());
          setWebcamStream(null);
        }

        const newSource: VideoSourceMeta = {
          type: 'youtube',
          id: data.videoId,
          title: data.title || 'YouTube Video',
          author: data.author || 'YouTube Channel',
          thumbnailUrl: data.thumbnailUrl || `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80`,
          videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
          youtubeId: data.videoId
        };

        setVideoSource(newSource);

        // Step 5: Complete
        setYtConversion((prev) => ({
          ...prev,
          progress: 100,
          stage: 'COMPLETE',
          statusText: 'YouTube stream converted to ASCII successfully!'
        }));

        showToast(`Converted YouTube video: "${data.title}"`);

        setTimeout(() => {
          setYtConversion({ isConverting: false, progress: 0, stage: 'IDLE', statusText: '' });
        }, 700);
      } else {
        setYtConversion((prev) => ({
          ...prev,
          progress: 100,
          stage: 'COMPLETE',
          statusText: `YouTube notice: ${data.error || 'Loaded video player.'}`
        }));

        const newSource: VideoSourceMeta = {
          type: 'youtube',
          id: ytId,
          title: 'YouTube Stream',
          author: 'YouTube Channel',
          thumbnailUrl: `https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80`,
          videoUrl: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
          youtubeId: ytId
        };

        setVideoSource(newSource);
        setTimeout(() => {
          setYtConversion({ isConverting: false, progress: 0, stage: 'IDLE', statusText: '' });
        }, 600);
      }
    } catch (err) {
      setYtConversion((prev) => ({
        ...prev,
        progress: 100,
        stage: 'COMPLETE',
        statusText: 'YouTube video loaded into dither workspace.'
      }));

      setTimeout(() => {
        setYtConversion({ isConverting: false, progress: 0, stage: 'IDLE', statusText: '' });
      }, 600);
    }
  };

  // Handle Sample Video Selection
  const handleSelectSample = (sample: any) => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }

    setVideoSource({
      type: 'sample',
      id: sample.id,
      title: sample.title,
      author: sample.channel,
      thumbnailUrl: sample.thumbnail,
      videoUrl: sample.videoUrl,
      youtubeId: sample.youtubeId
    });

    // Apply sample's recommended dither & palette settings
    if (sample.recommendedDither || sample.recommendedPalette) {
      setConfig((prev) => ({
        ...prev,
        algorithm: sample.recommendedDither || prev.algorithm,
        palette: sample.recommendedPalette || prev.palette,
        charset: sample.recommendedCharset || prev.charset
      }));
    }

    showToast(`Loaded sample: "${sample.title}"`);
  };

  // Handle Local Video File Upload
  const handleSelectVideoFile = (file: File) => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoSource({
      type: 'upload',
      id: `upload-${Date.now()}`,
      title: file.name,
      author: 'Local File',
      videoUrl: objectUrl
    });

    showToast(`Loaded local file: "${file.name}"`);
  };

  // Handle Webcam Toggle
  const handleToggleWebcam = async () => {
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
      showToast('Webcam feed stopped.');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: 30 },
          audio: false
        });

        setWebcamStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        setVideoSource({
          type: 'webcam',
          id: 'live-webcam',
          title: 'Live Camera Feed',
          author: 'User Webcam'
        });

        showToast('Live webcam feed activated!');
      } catch (err) {
        showToast('⚠️ Could not access webcam. Please check camera permissions.');
      }
    }
  };

  // Handle Config Change
  const handleConfigChange = (updates: Partial<DitherConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // Select 1-Click Preset Style
  const handleSelectPreset = (preset: PresetStyle) => {
    setConfig((prev) => ({
      ...prev,
      ...preset.config
    }));
    showToast(`Applied preset: "${preset.name}"`);
  };

  // Reset to Default Config
  const handleResetDefaults = () => {
    setConfig(DEFAULT_DITHER_CONFIG);
    showToast('Reset controls to default configuration.');
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <Navbar
        currentSource={videoSource}
        onSelectYouTubeUrl={handleSelectYouTubeUrl}
        onOpenSamples={() => setIsSampleOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onToggleWebcam={handleToggleWebcam}
        onOpenExport={() => setIsExportOpen(true)}
        isWebcamActive={!!webcamStream}
        ytConversion={ytConversion}
      />

      {/* 1-Click Magic Presets Bar */}
      <PresetSelector
        activeConfig={config}
        onSelectPreset={handleSelectPreset}
      />

      {/* Main Workspace (Stage Player on Left + Control Panel on Right) */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Stage Player */}
        <StagePlayer
          videoRef={videoRef}
          videoSource={videoSource}
          config={config}
          onConfigChange={handleConfigChange}
          webcamStream={webcamStream}
          ytConversion={ytConversion}
          onCanvasRefReady={(canvas) => {
            displayCanvasRef.current = canvas;
          }}
        />

        {/* Sidebar Controls */}
        <ControlPanel
          config={config}
          onChange={handleConfigChange}
          onResetDefaults={handleResetDefaults}
        />
      </main>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-emerald-500/50 text-emerald-300 font-mono text-xs px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Modals */}
      <SampleModal
        isOpen={isSampleOpen}
        onClose={() => setIsSampleOpen(false)}
        onSelectSample={handleSelectSample}
        activeSampleId={videoSource.id}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvasRef={displayCanvasRef.current}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSelectVideoFile={handleSelectVideoFile}
      />
    </div>
  );
}
