# 🚀 YouTube API - Koyeb තුල සීඝ්‍ර Deploy (5 විනාඩි)

## පියවර 1️⃣: YouTube Cookies ලබා ගැනීම (1 විනාඩි)

**Chrome/Edge/Firefox බිහිසුණු නම්:**

```bash
pip install yt-dlp
yt-dlp --cookies-from-browser chrome "https://www.youtube.com"
```

**නැතුවම:**
- Chrome extension: "Get cookies.txt" download කරන්න
- https://www.youtube.com ට login කරන්න
- cookies.txt download කරන්න
- `youtube_cookies.txt` නම් දෙන්න

## පියවර 2️⃣: GitHub එකට push කිරීම (2 විනාඩි)

```bash
# New repo create කරන්න GitHub එකෙන්
# "youtube-download-api" නම් දෙන්න

# Local එකෙන්:
git clone https://github.com/YOUR_USERNAME/youtube-download-api.git
cd youtube-download-api

# ZIP එකෙන් extract කරපු සිලින්ඩ ගිණුම් copy කරන්න
# දිගුවිට paste කරන්න:

git add .
git commit -m "Deploy to Koyeb"
git push origin main
```

## පියවර 3️⃣: Koyeb එකට Deploy කිරීම (2 විනාඩි)

1. **Koyeb login:**
   - https://app.koyeb.com

2. **Create Service click කරන්න**
   - "GitHub repository" select කරන්න
   - ඔබගේ repo "youtube-download-api" choose කරන්න

3. **Configure කරන්න:**
   - Runtime: Docker (automatic)
   - Port: 3000
   - Branch: main

4. **Deploy click කරන්න**
   - බලන්න 2-5 විනාඩි
   - ඔබගේ URL ලැබෙනු ඉතුරු! 🎉

---

## 📝 URL copy කරගන්න:
```
https://your-app-name-xyz.koyeb.sh
```

## ✅ Test කිරීම:

```bash
# Browser එකෙන් පිටින්න (YOUR-APP-NAME change කරන්න):
https://your-app-name-xyz.koyeb.sh/health

# Audio:
https://your-app-name-xyz.koyeb.sh/audio?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ

# Video:
https://your-app-name-xyz.koyeb.sh/video?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

---

## 🤖 WhatsApp Bot එකට යෙදීම:

```javascript
const API_URL = 'https://your-app-name-xyz.koyeb.sh';

// !audio <URL> command
const audioUrl = await axios.get(`${API_URL}/audio`, {
  params: { url: youtubeUrl }
});
console.log(audioUrl.data.audio_url);
```

**WhatsApp bot complete example:**
- `whatsapp-bot-example.js` බලන්න

---

## 🔄 කවදාවත් sleep නොවෙන (Always Alive):

✅ **Automatic:**
- Health check දිගින්දටම active තියා ගැනීම
- 3 විනාඩිට එක දාරි

✅ **Extra safe (Optional):**
- Uptime Robot (නොමිලේ): https://uptimerobot.com
- URL එකට ping කිරීම every 5 minutes

---

## ❓ Issues?

**"500 Error - Failed to retrieve"**
- YouTube cookies වලින් out of date
- නැවත cookies update කරන්න
- කිහිපයි විනාඩි බලන්න

**"Memory exceeded"**
- Koyeb dashboard එකෙන් restart කරන්න
- API රැඩ්‍රස් කරන්න concurrent requests

**"Service suspended"**
- Uptime Robot එකෙන් ping එක දාන්න
- හෝ manual restart කරන්න

---

## 🎯 API Endpoints:

```
GET /health                    // Keep-alive check
GET /audio?url=<YOUTUBE_URL>   // Download audio
GET /video?url=<YOUTUBE_URL>   // Download video
GET /info?url=<YOUTUBE_URL>    // Get video info
```

---

## 📚 Links:

- **README**: README.md බලන්න (සම්පූර්ණ තොරතුරු)
- **Deployment**: DEPLOYMENT_GUIDE.md බලන්න (detailed)
- **Bot Example**: whatsapp-bot-example.js බලන්න

---

**Done! 🎉 ඔබගේ YouTube API දැන් Koyeb එකෙන් 24/7 chalan කරයි!**

WhatsApp bot එකට link එක දින්න:
```
https://your-app-name-xyz.koyeb.sh
```
