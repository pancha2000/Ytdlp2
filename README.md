# 🎵 YouTube Download API - Optimized for Koyeb

Fast, lightweight YouTube video & audio download API optimized for Koyeb's free tier with keep-alive support and **API key authentication**.

## ✨ Features

- ⚡ **Super Fast** - Optimized for quick responses
- 💾 **Memory Efficient** - RAM-friendly with caching (5-min TTL)
- 🔄 **Keep-Alive** - Never sleeps or goes offline (health pings every 3 min)
- 🔐 **API Key Authentication** - Secure access control
- 🎯 **Streaming Ready** - Perfect for WhatsApp bots and instant messaging
- 🛡️ **Robust Error Handling** - Timeout protection and graceful fallbacks
- 📦 **Lightweight** - Alpine Linux base image (~400MB)

## 🚀 Quick Start

### Local Testing

```bash
# Clone/Download the project
cd youtube-download-api-optimized

# Install dependencies
npm install

# Create .env file
cp .env .env.local

# Generate master key and API keys
# In .env, set:
# MASTER_API_KEY=your-secure-master-key
# API_KEYS=api-key-1,api-key-2

# Start server
npm start

# Test health (no auth needed)
curl "http://localhost:3000/health"

# Test with API key
curl "http://localhost:3000/audio?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&key=api-key-1"
```

## 📡 API Endpoints

### 1. Health Check (Keep-Alive) - No Auth Required
```
GET /health
```
**Response:**
```json
{
  "status": "alive",
  "timestamp": "2024-02-03T14:30:00.000Z",
  "uptime": 3600,
  "version": "2.0.0"
}
```

### 2. Get Audio URL - Requires API Key
```
GET /audio?url=<YOUTUBE_URL>&key=<API_KEY>
```
**Response:**
```json
{
  "audio_url": "https://rr.----.googlevideo.com/...",
  "cached": false
}
```

### 3. Get Video URL - Requires API Key
```
GET /video?url=<YOUTUBE_URL>&key=<API_KEY>
```
**Response:**
```json
{
  "video_url": "https://rr.----.googlevideo.com/...",
  "cached": false
}
```

### 4. Get Video Information - Requires API Key
```
GET /info?url=<YOUTUBE_URL>&key=<API_KEY>
```
**Response:**
```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "duration": 212,
  "uploader": "Channel Name",
  "formats": 50,
  "cached": false
}
```

### 5. Generate New API Key - Requires Master Key
```
GET /generate-key?master_key=<MASTER_KEY>
```
**Response:**
```json
{
  "success": true,
  "api_key": "abc123def456...",
  "usage": "?key=abc123def456... or Header: X-API-Key: abc123def456..."
}
```

## 🔐 API Key Authentication

### Method 1: Query Parameter (Easiest)
```bash
curl "https://api.example.com/audio?url=<YOUTUBE_URL>&key=YOUR_API_KEY"
```

### Method 2: Custom Header
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
     "https://api.example.com/audio?url=<YOUTUBE_URL>"
```

### Method 3: Authorization Bearer
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.example.com/audio?url=<YOUTUBE_URL>"
```

## 🔑 Managing API Keys

### Getting Your Master Key
Check your deployment logs or `.env` file for `MASTER_API_KEY`.

### Generate New API Keys

```bash
# Via endpoint
curl "https://api.example.com/generate-key?master_key=YOUR_MASTER_KEY"

# Or pre-generate in .env
API_KEYS=key1,key2,key3
```

### Set in Environment Variables

```bash
# For your bot
export YOUTUBE_API_URL="https://your-api.koyeb.sh"
export YOUTUBE_API_KEY="your-generated-api-key"
```

## 🌐 Koyeb Deployment (Free Tier)

### Step 1: Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/youtube-api.git
git push -u origin main
```

### Step 2: Configure Environment Variables

In `.env` (before deploying):
```env
PORT=3000
NODE_ENV=production
MASTER_API_KEY=your-secure-master-key-here
API_KEYS=bot-api-key-1,bot-api-key-2,bot-api-key-3
```

### Step 3: Deploy on Koyeb

1. Login to Koyeb → https://app.koyeb.com
2. Create Service → "Deploy an app from a GitHub repo"
3. Select Your Repository
4. Configure:
   - Runtime: Docker
   - Port: 3000
5. Set Environment Variables:
   ```
   PORT=3000
   NODE_ENV=production
   MASTER_API_KEY=your-master-key
   API_KEYS=bot-key-1,bot-key-2
   ```
6. Deploy - Takes ~2-5 minutes
7. Get your public URL (e.g., `https://your-app-xyz.koyeb.sh`)

## 🤖 Bot Integration

### For Your Existing WhatsApp Bot

See **BOT_INTEGRATION_GUIDE.md** for complete integration instructions.

**Quick example:**

```javascript
const axios = require('axios');

const API_URL = 'https://your-app-xyz.koyeb.sh';
const API_KEY = 'your-generated-api-key';

async function downloadAudio(youtubeUrl) {
  const response = await axios.get(`${API_URL}/audio`, {
    params: { url: youtubeUrl, key: API_KEY }
  });
  return response.data.audio_url;
}
```

See `bot-integration.js` for complete examples.

## ⚙️ Environment Variables

```env
PORT=3000                           # Server port
NODE_ENV=production                # Environment
MASTER_API_KEY=your-master-key     # For generating new API keys
API_KEYS=key1,key2,key3            # Pre-generated API keys
USER_AGENT=...                     # Custom User-Agent (optional)
PROXY_URL=...                      # Proxy URL (optional)
```

## 🔍 Troubleshooting

### 401 - Missing API Key
- Add `?key=YOUR_KEY` to URL
- Or set `X-API-Key` header
- Or use `Authorization: Bearer YOUR_KEY`

### 403 - Invalid API Key
- Check if key is correct
- Regenerate using `/generate-key`
- Verify key is in `API_KEYS` env var

### 500 - Failed to retrieve URL
- URL might be restricted
- YouTube cookies might be outdated
- Try again in a few minutes

### 504 - Timeout
- YouTube is slow
- Retry in 30 seconds
- Check network connectivity

## 📚 Additional Documentation

- **BOT_INTEGRATION_GUIDE.md** - Complete integration guide for your bot
- **bot-integration.js** - Code examples for different bot frameworks
- **DEPLOYMENT_GUIDE.md** - Detailed deployment instructions
- **QUICK_START_SINHALA.md** - සිංහල deployment guide

## 📊 Performance Metrics

- **Response Time:** 2-10 seconds (depending on YouTube)
- **Memory Usage:** ~50-100MB (very lean)
- **Cache Hit:** <100ms
- **Max Concurrent:** Limited by Koyeb tier

## 🔐 Security Notes

1. **API Key Protection** - All endpoints except /health require API key
2. **Input Validation** - All URLs validated before use
3. **Timeout Protection** - All requests timeout after 30-60s
4. **Non-root User** - Docker runs as `nodejs` user
5. **No File Storage** - URLs only, no downloads stored on server

## 📝 License

MIT License - Feel free to modify and use!

## 🆘 Support

- **Koyeb Docs:** https://docs.koyeb.com
- **yt-dlp:** https://github.com/yt-dlp/yt-dlp
- **Express.js:** https://expressjs.com

---

**Made with ❤️ for WhatsApp Bots & Bot Integration on Koyeb**
