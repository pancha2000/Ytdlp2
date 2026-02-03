# 🚀 Koyeb මාතෘකා Deployment Guide

## සිංහල විස්තරය (Sinhala Instructions)

### ✅ පුරාවෙහි කිරීම් (Prerequisites)

1. **GitHub Account** - https://github.com
2. **Koyeb Account** - https://app.koyeb.com (නොමිලේ sign up කරන්න)
3. **yt-dlp** - YouTube cookies සමඟ (ප්‍රකාශන ගිණුමක් අවශ්‍ය)

### 🔐 YouTube Cookies ලබා ගැනීම

```bash
# Ubuntu/Linux/Mac
pip install yt-dlp
yt-dlp --cookies-from-browser chrome "https://www.youtube.com"

# Windows
pip install yt-dlp
yt-dlp --cookies-from-browser edge "https://www.youtube.com"
```

یا **browser extension use කරන්න:**
- Chrome: "Get cookies.txt" extension install කරන්න
- https://www.youtube.com ට login කරන්න
- cookies.txt download කරන්න
- cookies.txt ගිණුම මෙම folder එකට paste කරන්න

### 📦 GitHub එකට Upload කිරීම

```bash
# 1. GitHub එකට new repository හදාගන්න
# "youtube-download-api" නම් දෙන්න

# 2. Local folder එකෙන්
git clone https://github.com/YOUR_USERNAME/youtube-download-api.git
cd youtube-download-api

# 3. සියලුම ගිණුම් මෙතැනට copy කරන්න:
# - index.js
# - package.json
# - Dockerfile
# - .env
# - youtube_cookies.txt

# 4. Push කරන්න
git add .
git commit -m "Initial commit"
git push origin main
```

### 🌐 Koyeb එකට Deploy කිරීම

**Step 1:** Koyeb එකට login කරන්න
- https://app.koyeb.com/auth/login

**Step 2:** "Create Service" click කරන්න
- Deploy a service → GitHub repository

**Step 3:** Repository select කරන්න
- ඔබගේ "youtube-download-api" repository choose කරන්න
- Branch: main (default)

**Step 4:** Configure කරන්න
```
- Runtime: Docker (දැනටමත් automatic)
- Dockerfile Path: ./Dockerfile
- Port: 3000
- Environment: production
```

**Step 5:** Environmental variables එකට add කරන්න (optional)
```
PORT=3000
NODE_ENV=production
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

**Step 6:** Deploy button click කරන්න
- Deploy button click කරන්න
- 2-5 විනාඩි බලන්න
- Your public URL ලැබෙනු ඉතුරු

### ✅ Testing කිරීම

Deploy සාර්ථක වුණු පසු:

```bash
# Your-App-Name.koyeb.sh change කරන්න
curl "https://your-app-xyz.koyeb.sh/health"

# Audio download test
curl "https://your-app-xyz.koyeb.sh/audio?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Video download test  
curl "https://your-app-xyz.koyeb.sh/video?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

### 🔄 Keep-Alive (කවදාවත් shut down නොවෙන)

✅ **Automatic Keep-Alive:**
- Health check දිගින්දටම /health endpoint ping කරයි
- 3 විනාඩිට එක දාරි ping එකක් (automatic)

✅ **Optional External Monitoring:**
- **Uptime Robot** (නොමිලේ)
  - https://uptimerobot.com
  - Add Monitor → HTTP(s)
  - URL: https://your-app-xyz.koyeb.sh/health
  - Interval: 5 minutes

---

## English Instructions

### ✅ Prerequisites

1. **GitHub Account** - https://github.com
2. **Koyeb Account** - https://app.koyeb.com (free signup)
3. **yt-dlp with YouTube cookies**

### 🔐 Get YouTube Cookies

**Option 1 - Automatic:**
```bash
pip install yt-dlp
# Ubuntu/Linux/Mac
yt-dlp --cookies-from-browser chrome "https://www.youtube.com"

# Windows
yt-dlp --cookies-from-browser edge "https://www.youtube.com"
```

**Option 2 - Manual (Browser Extension):**
1. Install "Get cookies.txt" extension
2. Login to YouTube
3. Download cookies.txt
4. Save as `youtube_cookies.txt` in this folder

### 📦 Upload to GitHub

```bash
# 1. Create new repo on GitHub: "youtube-download-api"

# 2. Clone your repo
git clone https://github.com/YOUR_USERNAME/youtube-download-api.git
cd youtube-download-api

# 3. Copy all files here:
# - index.js
# - package.json
# - Dockerfile
# - .env
# - youtube_cookies.txt

# 4. Push
git add .
git commit -m "Initial commit"
git push origin main
```

### 🌐 Deploy on Koyeb

1. **Login:** https://app.koyeb.com
2. **Create Service** → "GitHub repository"
3. **Select:** Your "youtube-download-api" repo
4. **Configure:**
   - Runtime: Docker
   - Port: 3000
   - Branch: main
5. **Environment Variables** (optional):
   ```
   PORT=3000
   NODE_ENV=production
   ```
6. **Deploy** - Wait 2-5 minutes

### ✅ Test Your API

```bash
# Replace your-app-xyz with actual name
curl "https://your-app-xyz.koyeb.sh/health"
curl "https://your-app-xyz.koyeb.sh/audio?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

### 🔄 Keep-Alive Setup

✅ **Automatic:** Built-in health pings every 3 minutes

✅ **Optional Monitor:**
- Use Uptime Robot (free): https://uptimerobot.com
- Add HTTP monitor
- URL: `https://your-app-xyz.koyeb.sh/health`
- Check every 5 minutes

---

## 🤖 WhatsApp Bot Integration

See `whatsapp-bot-example.js` for complete example.

**Quick Setup:**
```bash
npm install whatsapp-web.js axios

# Create bot file
cp whatsapp-bot-example.js mybot.js

# Run
node mybot.js
```

**Commands:**
- `!audio <url>` - Download audio
- `!video <url>` - Download video
- `!info <url>` - Get video info
- `!help` - Show help

---

## 🆘 Troubleshooting

### "Failed to build Docker image"
- Check if Dockerfile exists
- Ensure all required files are in repo
- Check file permissions

### "500 Error - Failed to retrieve URL"
- YouTube may have updated bot detection
- Update youtube_cookies.txt
- Retry after few minutes
- Check Koyeb logs for details

### "Service suspended"
- Koyeb suspends idle services
- Uptime Robot will wake it up
- Ensure health check is enabled

### "Memory usage high"
- Restart service in Koyeb dashboard
- Reduce concurrent requests
- Check for memory leaks in logs

---

## 📚 Useful Links

- **Koyeb Docs:** https://docs.koyeb.com
- **yt-dlp GitHub:** https://github.com/yt-dlp/yt-dlp
- **WhatsApp-Web.js:** https://github.com/pedroslopez/whatsapp-web.js
- **Docker Hub:** https://hub.docker.com

---

**Happy Deploying! 🎉**
