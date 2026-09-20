import express from "express";
import path from "path";
import { Readable } from "stream";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Media / Video Stream Proxy to guarantee CORS headers and canvas export compatibility
  app.get("/api/video-proxy", async (req, res) => {
    try {
      const targetUrl = req.query.url as string;
      if (!targetUrl) {
        return res.status(400).send("Missing target video URL");
      }

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

      const rangeHeader = req.headers.range;
      const fetchHeaders: Record<string, string> = {};
      if (rangeHeader) {
        fetchHeaders["range"] = rangeHeader;
      }

      const response = await fetch(targetUrl, { headers: fetchHeaders });

      if (!response.ok && response.status !== 206) {
        return res.status(response.status).send(`Proxy fetch failed: ${response.statusText}`);
      }

      res.status(response.status);

      const headersToForward = ["content-type", "content-length", "content-range", "accept-ranges"];
      headersToForward.forEach((h) => {
        const val = response.headers.get(h);
        if (val) res.setHeader(h, val);
      });

      if (response.body) {
        // @ts-ignore
        const nodeStream = Readable.fromWeb(response.body);
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (err: any) {
      console.error("Video proxy error:", err);
      res.status(500).send(err.message || "Video proxy failed");
    }
  });

  // Sample YouTube Videos & Stream Sources (CORS enabled open media)
  const CURATED_SAMPLES = [
    {
      id: "bad-apple",
      youtubeId: "FtutLA63Cp8",
      title: "Bad Apple!! - High Contrast Animation",
      channel: "Nomico / Shadow Art",
      thumbnail: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
      duration: "3:39",
      tags: ["High Contrast", "Anime", "Classic ASCII Target"],
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      fallbackVideoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      recommendedDither: "atkinson",
      recommendedPalette: "monochrome",
      recommendedCharset: "blocks"
    },
    {
      id: "matrix-rain",
      youtubeId: "mqy8gCllp30",
      title: "The Matrix - Digital Code Rain Stream",
      channel: "Warner Bros. / Cyberpunk",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
      duration: "2:15",
      tags: ["Matrix", "Cyberpunk", "Green CRT"],
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      fallbackVideoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      recommendedDither: "floyd-steinberg",
      recommendedPalette: "classic-green",
      recommendedCharset: "matrix-katakana"
    },
    {
      id: "synthwave-drive",
      youtubeId: "4xDzrJKXOOY",
      title: "Synthwave Outrun Neon Sunset Drive",
      channel: "RetroWave Official",
      thumbnail: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80",
      duration: "4:20",
      tags: ["Synthwave", "Neon", "Retrofuturism"],
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      fallbackVideoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      recommendedDither: "bayer-4",
      recommendedPalette: "synthwave",
      recommendedCharset: "dense"
    },
    {
      id: "cyberpunk-2077",
      youtubeId: "vjF9GWEZsXA",
      title: "Cyberpunk Night City Holographic Trailer",
      channel: "CD PROJEKT RED",
      thumbnail: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80",
      duration: "1:45",
      tags: ["Cyberpunk", "Action", "RGB Color"],
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      fallbackVideoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      recommendedDither: "bayer-8",
      recommendedPalette: "cyberpunk-neon",
      recommendedCharset: "braille"
    },
    {
      id: "lofi-anime",
      youtubeId: "jfKfPfyJRdk",
      title: "Lofi Hip Hop Radio - Beats to Relax/Study to",
      channel: "Lofi Girl",
      thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
      duration: "Live",
      tags: ["Lofi", "Chill", "Anime"],
      videoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      fallbackVideoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      recommendedDither: "halftone",
      recommendedPalette: "amber-crt",
      recommendedCharset: "standard"
    },
    {
      id: "rickroll",
      youtubeId: "dQw4w9WgXcQ",
      title: "Rick Astley - Never Gonna Give You Up",
      channel: "Rick Astley",
      thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
      duration: "3:32",
      tags: ["Meme", "Music Video", "80s Pop"],
      videoUrl: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      fallbackVideoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      recommendedDither: "stucki",
      recommendedPalette: "gameboy",
      recommendedCharset: "standard"
    }
  ];

  // API endpoint for YouTube video info
  app.get("/api/youtube/info", async (req, res) => {
    try {
      const videoUrl = req.query.url as string;
      if (!videoUrl) {
        return res.status(400).json({ error: "Missing 'url' query parameter" });
      }

      // Extract YouTube Video ID
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoUrl.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;

      if (!videoId) {
        return res.status(400).json({ error: "Invalid YouTube URL format" });
      }

      // Fetch oEmbed metadata
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        return res.status(404).json({
          error: "YouTube video not found or private",
          videoId
        });
      }

      const oembedData = await response.json();

      return res.json({
        videoId,
        title: oembedData.title || "YouTube Video",
        author: oembedData.author_name || "YouTube Creator",
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        maxResThumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`,
        oembed: oembedData
      });
    } catch (err: any) {
      console.error("YouTube Info Error:", err);
      return res.status(500).json({ error: err.message || "Failed to fetch YouTube details" });
    }
  });

  // API endpoint for curated sample videos
  app.get("/api/samples", (req, res) => {
    res.json(CURATED_SAMPLES);
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ASCII Magic Dither Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
