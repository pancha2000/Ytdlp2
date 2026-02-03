require('dotenv').config();

const express = require("express");
const { spawn } = require("child_process");
const NodeCache = require("node-cache");
const http = require("http");
const crypto = require("crypto");

const app = express();
const port = process.env.PORT || 3000;

// Simple in-memory cache (5 min TTL) - RAM friendly
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

const USER_AGENT = process.env.USER_AGENT || 
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
const PROXY_URL = process.env.PROXY_URL;

// API Key Management
const MASTER_API_KEY = process.env.MASTER_API_KEY || generateSecureKey();
const validApiKeys = new Set(process.env.API_KEYS ? process.env.API_KEYS.split(',') : [MASTER_API_KEY]);

console.log(`✅ API Keys initialized. Master key length: ${MASTER_API_KEY.length}`);

/**
 * Generate a secure random API key
 */
function generateSecureKey() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * API Key validation middleware
 */
function validateApiKey(req, res, next) {
  // Allow /health without key
  if (req.path === '/health' || req.path === '/') {
    return next();
  }

  const apiKey = req.query.key || req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  if (!apiKey) {
    return res.status(401).json({ 
      error: "Missing API key",
      message: "Provide key as query parameter (?key=YOUR_KEY) or header (X-API-Key: YOUR_KEY)"
    });
  }

  if (!validApiKeys.has(apiKey)) {
    console.warn(`⚠️ Invalid API key attempt: ${apiKey.slice(0, 10)}...`);
    return res.status(403).json({ 
      error: "Invalid API key",
      message: "The provided API key is not valid"
    });
  }

  // API key is valid, continue
  req.apiKey = apiKey;
  next();
}

// Apply API key validation to all endpoints except /health and /
app.use(validateApiKey);

// Keep-alive health check handler
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "2.0.0"
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "🎵 YouTube Download API - Optimized for Koyeb",
    version: "2.0.0",
    requiresAuth: true,
    endpoints: {
      health: "/health (no auth required)",
      audio: "/audio?url=<youtube_url>&key=<api_key>",
      video: "/video?url=<youtube_url>&key=<api_key>",
      info: "/info?url=<youtube_url>&key=<api_key>",
      "generate-key": "/generate-key?master_key=<master_key>"
    },
    auth: {
      method: "Query parameter or Header",
      queryParam: "key=YOUR_API_KEY",
      header: "X-API-Key: YOUR_API_KEY",
      bearer: "Authorization: Bearer YOUR_API_KEY"
    }
  });
});

// Generate new API key (requires master key)
app.get("/generate-key", (req, res) => {
  const masterKey = req.query.master_key || req.headers['x-master-key'];

  if (!masterKey) {
    return res.status(401).json({ 
      error: "Missing master key",
      message: "Provide master_key as query parameter or X-Master-Key header"
    });
  }

  if (masterKey !== MASTER_API_KEY) {
    console.warn(`⚠️ Invalid master key attempt`);
    return res.status(403).json({ 
      error: "Invalid master key",
      message: "The provided master key is not valid"
    });
  }

  const newKey = generateSecureKey();
  validApiKeys.add(newKey);

  res.json({
    success: true,
    message: "New API key generated successfully",
    api_key: newKey,
    usage: `?key=${newKey} or Header: X-API-Key: ${newKey}`,
    expires: "Never (stored in memory, resets on restart)"
  });
});

// Information endpoint - අඩු bandwidth යොදයි
app.get("/info", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL parameter." });
  }

  const cacheKey = `info_${url}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  const args = [
    "-j", // JSON output
    "--no-warnings",
    "--skip-download",
    "--user-agent", USER_AGENT,
    "--cookies", "youtube_cookies.txt",
    url
  ];

  if (PROXY_URL) args.unshift("--proxy", PROXY_URL);

  const child = spawn("yt-dlp", args, { 
    timeout: 30000,
    maxBuffer: 1024 * 1024 * 2 // 2MB buffer
  });

  let stdout = "";
  let stderr = "";
  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, 30000);

  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  child.on("close", (code) => {
    clearTimeout(timeout);

    if (timedOut) {
      return res.status(504).json({ error: "Request timeout" });
    }

    if (code !== 0) {
      console.error(`yt-dlp error: ${stderr}`);
      return res.status(500).json({ 
        error: "Failed to fetch video info",
        details: stderr.slice(0, 200)
      });
    }

    try {
      const data = JSON.parse(stdout);
      const info = {
        id: data.id,
        title: data.title,
        duration: data.duration,
        uploader: data.uploader,
        formats: data.formats ? data.formats.length : 0,
        cached: false
      };

      cache.set(cacheKey, info);
      res.json(info);
    } catch (e) {
      res.status(500).json({ error: "Failed to parse video info" });
    }
  });

  child.on("error", (err) => {
    clearTimeout(timeout);
    res.status(500).json({ error: "yt-dlp execution failed", details: err.message });
  });
});

// Audio download endpoint
app.get("/audio", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL parameter." });
  }

  const cacheKey = `audio_${url}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  const args = [
    "-f", "bestaudio",
    "--get-url",
    "--no-warnings",
    "--user-agent", USER_AGENT,
    "--cookies", "youtube_cookies.txt",
    "--socket-timeout", "30",
    url
  ];

  if (PROXY_URL) args.unshift("--proxy", PROXY_URL);

  const child = spawn("yt-dlp", args, { 
    timeout: 45000,
    maxBuffer: 1024 * 512 // 512KB buffer
  });

  let stdout = "";
  let stderr = "";
  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, 45000);

  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  child.on("close", (code) => {
    clearTimeout(timeout);

    if (timedOut) {
      return res.status(504).json({ error: "Request timeout - try again later" });
    }

    if (code !== 0) {
      console.error(`Audio fetch error: ${stderr.slice(0, 500)}`);
      return res.status(500).json({
        error: "Failed to retrieve audio URL",
        details: stderr.slice(0, 150)
      });
    }

    const audioUrl = stdout.trim();
    if (!audioUrl) {
      return res.status(500).json({ error: "No audio URL returned" });
    }

    const result = { audio_url: audioUrl, cached: false };
    cache.set(cacheKey, result);
    res.json(result);
  });

  child.on("error", (err) => {
    clearTimeout(timeout);
    res.status(500).json({ error: "yt-dlp error", details: err.message });
  });
});

// Video download endpoint
app.get("/video", (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: "Missing YouTube URL parameter." });
  }

  const cacheKey = `video_${url}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json({ ...cached, cached: true });
  }

  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: "Invalid URL format." });
  }

  const args = [
    "-f", "bestvideo+bestaudio",
    "--get-url",
    "--no-warnings",
    "--user-agent", USER_AGENT,
    "--cookies", "youtube_cookies.txt",
    "--socket-timeout", "30",
    url
  ];

  if (PROXY_URL) args.unshift("--proxy", PROXY_URL);

  const child = spawn("yt-dlp", args, { 
    timeout: 60000,
    maxBuffer: 1024 * 512 // 512KB buffer
  });

  let stdout = "";
  let stderr = "";
  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, 60000);

  child.stdout.on("data", (data) => {
    stdout += data.toString();
  });

  child.stderr.on("data", (data) => {
    stderr += data.toString();
  });

  child.on("close", (code) => {
    clearTimeout(timeout);

    if (timedOut) {
      return res.status(504).json({ error: "Request timeout - try again later" });
    }

    if (code !== 0) {
      console.error(`Video fetch error: ${stderr.slice(0, 500)}`);
      return res.status(500).json({
        error: "Failed to retrieve video URL",
        details: stderr.slice(0, 150)
      });
    }

    const videoUrl = stdout.trim();
    if (!videoUrl) {
      return res.status(500).json({ error: "No video URL returned" });
    }

    const result = { video_url: videoUrl, cached: false };
    cache.set(cacheKey, result);
    res.json(result);
  });

  child.on("error", (err) => {
    clearTimeout(timeout);
    res.status(500).json({ error: "yt-dlp error", details: err.message });
  });
});

// Keep-alive service - සෙවින තුනකට එක දාරි ping එකක්
const keepAliveInterval = setInterval(() => {
  const request = http.get(`http://localhost:${port}/health`, (res) => {
    console.log(`[${new Date().toISOString()}] Keep-alive ping: ${res.statusCode}`);
  });

  request.on("error", (err) => {
    console.error("Keep-alive ping failed:", err.message);
  });

  request.setTimeout(5000);
}, 180000); // සෙවින තුනකට එක

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...");
  clearInterval(keepAliveInterval);
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 YouTube Download API running on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/health`);
});

// Prevent idle timeout - keep connection alive
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
