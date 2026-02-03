# 🤖 YouTube API Integration Guide - For Your WhatsApp Bot

**This guide shows how to integrate with your existing WhatsApp bot that runs separately.**

---

## 🔑 API Key Authentication

### Getting Your Master Key

When you deploy the API server, it automatically generates a `MASTER_API_KEY`. 

**To get your master key:**

1. Check your `.env` file or deploy logs
2. If auto-generated, it will be printed at startup
3. Or set it yourself in `.env`:
   ```
   MASTER_API_KEY=my-secure-master-key-12345
   ```

### Generating API Keys for Your Bot

**Option 1: Use the generate-key endpoint**

```bash
# Generate a new API key (requires master key)
curl "https://your-api.koyeb.sh/generate-key?master_key=YOUR_MASTER_KEY"

# Or with header:
curl -H "X-Master-Key: YOUR_MASTER_KEY" \
     "https://your-api.koyeb.sh/generate-key"
```

**Response:**
```json
{
  "success": true,
  "api_key": "abc123def456...",
  "usage": "?key=abc123def456... or Header: X-API-Key: abc123def456...",
  "expires": "Never (stored in memory)"
}
```

**Option 2: Pre-generate in .env**

```env
# Set multiple API keys in .env
API_KEYS=bot-key-1,bot-key-2,bot-key-3
```

---

## 📡 Using the API from Your Bot

### 1. Audio Download

```javascript
// Node.js example
const axios = require('axios');

const API_URL = 'https://your-api.koyeb.sh';
const API_KEY = 'your-generated-api-key';

async function getAudioUrl(youtubeUrl) {
  try {
    const response = await axios.get(`${API_URL}/audio`, {
      params: {
        url: youtubeUrl,
        key: API_KEY
      },
      timeout: 50000
    });
    
    return response.data.audio_url;
  } catch (error) {
    console.error('Failed to get audio:', error.message);
    return null;
  }
}

// Usage in your bot
const audioUrl = await getAudioUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
if (audioUrl) {
  // Send to user
  console.log('Audio URL:', audioUrl);
}
```

### 2. Video Download

```javascript
async function getVideoUrl(youtubeUrl) {
  try {
    const response = await axios.get(`${API_URL}/video`, {
      params: {
        url: youtubeUrl,
        key: API_KEY
      },
      timeout: 60000
    });
    
    return response.data.video_url;
  } catch (error) {
    console.error('Failed to get video:', error.message);
    return null;
  }
}
```

### 3. Get Video Information

```javascript
async function getVideoInfo(youtubeUrl) {
  try {
    const response = await axios.get(`${API_URL}/info`, {
      params: {
        url: youtubeUrl,
        key: API_KEY
      },
      timeout: 30000
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to get info:', error.message);
    return null;
  }
}

// Usage
const info = await getVideoInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
if (info) {
  console.log(`Title: ${info.title}`);
  console.log(`Duration: ${info.duration}s`);
  console.log(`Uploader: ${info.uploader}`);
}
```

---

## 🔐 Three Ways to Provide API Key

### Method 1: Query Parameter (Easiest)
```javascript
axios.get(`${API_URL}/audio?url=${youtubeUrl}&key=${API_KEY}`);
```

### Method 2: Custom Header
```javascript
const response = await axios.get(`${API_URL}/audio?url=${youtubeUrl}`, {
  headers: {
    'X-API-Key': API_KEY
  }
});
```

### Method 3: Authorization Bearer
```javascript
const response = await axios.get(`${API_URL}/audio?url=${youtubeUrl}`, {
  headers: {
    'Authorization': `Bearer ${API_KEY}`
  }
});
```

---

## 🔄 Caching (Automatic)

The API caches results for 5 minutes. Your bot will benefit from:

- **First request:** 5-15 seconds (depending on YouTube)
- **Cached request:** < 100ms (instant!)

The response includes a `cached` flag:

```json
{
  "audio_url": "https://...",
  "cached": true
}
```

---

## ✅ Complete Bot Integration Example

```javascript
const axios = require('axios');

class YouTubeAPI {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.cache = new Map();
  }

  async makeRequest(endpoint, youtubeUrl) {
    const cacheKey = `${endpoint}_${youtubeUrl}`;
    
    // Bot-side caching (optional, API already caches)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5 min
        return cached.data;
      }
    }

    try {
      const response = await axios.get(`${this.apiUrl}/${endpoint}`, {
        params: {
          url: youtubeUrl,
          key: this.apiKey
        },
        timeout: endpoint === 'video' ? 60000 : 50000
      });

      // Cache on bot side too
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  async getAudio(youtubeUrl) {
    const result = await this.makeRequest('audio', youtubeUrl);
    return result.audio_url;
  }

  async getVideo(youtubeUrl) {
    const result = await this.makeRequest('video', youtubeUrl);
    return result.video_url;
  }

  async getInfo(youtubeUrl) {
    return await this.makeRequest('info', youtubeUrl);
  }
}

// Usage in your bot:
const youtube = new YouTubeAPI(
  'https://your-api.koyeb.sh',
  'your-api-key-here'
);

// In your message handler:
async function handleYouTubeCommand(url, type) {
  try {
    if (type === 'audio') {
      const audioUrl = await youtube.getAudio(url);
      return `🎵 Audio ready: ${audioUrl}`;
    } else if (type === 'video') {
      const videoUrl = await youtube.getVideo(url);
      return `🎥 Video ready: ${videoUrl}`;
    } else if (type === 'info') {
      const info = await youtube.getInfo(url);
      return `📊 ${info.title} (${info.duration}s) by ${info.uploader}`;
    }
  } catch (error) {
    return `❌ Error: ${error.message}`;
  }
}
```

---

## 🔄 Error Handling

```javascript
async function downloadAudio(url) {
  try {
    const response = await axios.get(`${API_URL}/audio`, {
      params: { url, key: API_KEY },
      timeout: 50000
    });

    if (!response.data.audio_url) {
      throw new Error('No URL returned');
    }

    return response.data.audio_url;

  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ Missing API key');
    } else if (error.response?.status === 403) {
      console.error('❌ Invalid API key');
    } else if (error.response?.status === 504) {
      console.error('⏳ YouTube too slow, retry in 30s');
    } else if (error.code === 'ECONNABORTED') {
      console.error('⏱️ Request timeout');
    } else {
      console.error('❌ Error:', error.message);
    }
    return null;
  }
}
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────┐
│  Your WhatsApp Bot  │
│   (runs separate)   │
└──────────┬──────────┘
           │
           │ HTTP requests with API key
           │ (axios, fetch, requests, etc.)
           ▼
┌─────────────────────┐
│   YouTube API       │
│  (Koyeb server)     │
│  Port 3000          │
│  Keep-alive active  │
│  Caching enabled    │
└─────────────────────┘
           │
           │ yt-dlp
           │
           ▼
      YouTube.com
```

---

## 📊 API Response Examples

### Audio Response
```json
{
  "audio_url": "https://rr.xxx.googlevideo.com/...",
  "cached": false
}
```

### Video Response
```json
{
  "video_url": "https://rr.xxx.googlevideo.com/...",
  "cached": false
}
```

### Info Response
```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Rick Astley - Never Gonna Give You Up",
  "duration": 212,
  "uploader": "Rick Astley",
  "formats": 50,
  "cached": false
}
```

### Health Check (no auth needed)
```json
{
  "status": "alive",
  "timestamp": "2024-02-03T14:30:00.000Z",
  "uptime": 3600,
  "version": "2.0.0"
}
```

---

## 🛡️ Security Best Practices

1. **Never commit API keys to GitHub**
   ```bash
   # .gitignore
   .env
   .env.local
   *.key
   ```

2. **Use environment variables in your bot**
   ```javascript
   const API_KEY = process.env.YOUTUBE_API_KEY;
   ```

3. **Rotate API keys periodically**
   - Generate new keys via `/generate-key`
   - Update your bot to use new key
   - Discard old key

4. **Monitor API usage**
   - Check Koyeb logs for errors
   - Track rate limiting
   - Watch for unusual patterns

5. **Set up alerts**
   - Monitor `/health` endpoint
   - Alert if API goes down
   - Check cache hit rates

---

## 🔧 Configuration for Your Bot

Create a config file for your bot:

```javascript
// config.js
module.exports = {
  youtube: {
    apiUrl: process.env.YOUTUBE_API_URL || 'https://your-api.koyeb.sh',
    apiKey: process.env.YOUTUBE_API_KEY,
    timeout: {
      audio: 50000,
      video: 60000,
      info: 30000
    },
    cacheTime: 300000, // 5 minutes
    retryAttempts: 3,
    retryDelay: 5000
  },
  whatsapp: {
    // Your WhatsApp bot config
  }
};
```

```javascript
// bot.js
const config = require('./config');
const YouTubeAPI = require('./youtube-api');

const youtube = new YouTubeAPI(
  config.youtube.apiUrl,
  config.youtube.apiKey
);

// Use in your bot...
```

---

## 📝 Environment Variables for Your Bot

```bash
# .env (bot side)
YOUTUBE_API_URL=https://your-api.koyeb.sh
YOUTUBE_API_KEY=your-generated-api-key-here

# WhatsApp bot config
WHATSAPP_TOKEN=xxx
WHATSAPP_WEBHOOK=xxx
```

---

## 🆘 Troubleshooting

### API Key Errors

```
401 - Missing API key
→ Add ?key=YOUR_KEY to URL or X-API-Key header

403 - Invalid API key
→ Check if key is correct, regenerate if needed

404 - Endpoint not found
→ Check endpoint path (audio, video, info)
```

### Timeout Errors

```
504 - Request timeout
→ YouTube is slow, retry in 30 seconds
→ Increase timeout in axios config

ECONNREFUSED
→ API server is down/restarting
→ Check Koyeb dashboard
```

### YouTube Errors

```
500 - Failed to retrieve URL
→ URL might be restricted/private
→ YouTube cookies might be outdated
→ Try again in a few minutes
```

---

## 📚 More Resources

- **API Endpoints**: See README.md
- **Deployment**: See DEPLOYMENT_GUIDE.md
- **Koyeb Docs**: https://docs.koyeb.com
- **Axios Docs**: https://axios-http.com

---

**Now you're ready to connect your WhatsApp bot to the YouTube API! 🚀**
