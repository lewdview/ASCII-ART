export interface YouTubeVideoInfo {
  videoId: string;
  title: string;
  author?: string;
  thumbnailUrl: string;
  maxResThumbnailUrl: string;
  embedUrl: string;
}

/**
 * Parses any YouTube link to extract the 11-character video ID
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  // Plain 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // standard watch url, short url, embed, or shorts
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regex);

  return match ? match[1] : null;
}

/**
 * Constructs YouTube thumbnail URLs
 */
export function getYouTubeThumbnails(videoId: string) {
  return {
    default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
    mq: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
    hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  };
}

/**
 * Formats video time in MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (num: number) => num.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}
