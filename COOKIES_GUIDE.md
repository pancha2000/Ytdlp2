# 🍪 YouTube Cookies Management Guide

## කුකීස් කිසිදු විධියකින් ලබා ගැනීම

---

## ✨ Option 1: Auto-Download (Recommended)

### Local Machine (Before Deployment)

```bash
# Install script dependencies
npm install

# Run auto-download script
node update-cookies.js
```

**What it does:**
- ✅ Auto-detects your browser (Chrome/Firefox/Edge)
- ✅ Downloads fresh cookies from YouTube
- ✅ Backups old cookies
- ✅ Verifies cookie validity
- ✅ Shows cookie age

**Requirements:**
- yt-dlp: `pip install yt-dlp`
- Any login browser (Chrome, Firefox, Edge)

---

## 🌐 Option 2: Browser Extension (Easiest)

### Step 1: Install Extension

**For Chrome:**
1. Go to: https://chrome.google.com/webstore
2. Search: "Get cookies.txt"
3. Click "Add to Chrome"

**For Firefox:**
1. Go to: https://addons.mozilla.org
2. Search: "Get cookies.txt"
3. Click "Add to Firefox"

**For Edge:**
1. Go to: https://microsoftedge.microsoft.com/addons
2. Search: "Get cookies.txt"
3. Click "Add to Edge"

### Step 2: Login to YouTube

```
https://youtube.com
# Login with your account
```

### Step 3: Export Cookies

1. Click extension icon in toolbar
2. Select "Export (Netscape format)"
3. Save file as: `youtube_cookies.txt`

### Step 4: Place File

Move to project folder:
```bash
# Linux/Mac
cp ~/Downloads/youtube_cookies.txt ./youtube-download-api-optimized/

# Windows
move C:\Users\YourName\Downloads\youtube_cookies.txt youtube-download-api-optimized\
```

---

## 💻 Option 3: Command Line

### Install yt-dlp

```bash
# Using pip
pip install yt-dlp

# Using brew (Mac)
brew install yt-dlp

# Using apt (Ubuntu/Debian)
sudo apt install yt-dlp
```

### Download Cookies

**Chrome:**
```bash
yt-dlp --cookies-from-browser chrome "https://www.youtube.com"
```

**Firefox:**
```bash
yt-dlp --cookies-from-browser firefox "https://www.youtube.com"
```

**Edge:**
```bash
yt-dlp --cookies-from-browser edge "https://www.youtube.com"
```

**Chromium:**
```bash
yt-dlp --cookies-from-browser chromium "https://www.youtube.com"
```

### Verify Download

```bash
# Check if youtube_cookies.txt exists
ls -lh youtube_cookies.txt

# Check file size (should be >50KB)
wc -c youtube_cookies.txt
```

---

## 🔄 Option 4: Periodic Updates (After Deployment)

### Weekly Updates via Cron

**Linux/Mac:**
```bash
# Edit crontab
crontab -e

# Add this line (updates every Sunday at 2 AM)
0 2 * * 0 cd /path/to/youtube-api && node update-cookies.js >> cookies-update.log 2>&1
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Weekly
4. Action: `node C:\path\to\update-cookies.js`

### Manual Update

```bash
# Whenever needed
node update-cookies.js

# Check log
cat cookies-update.log
```

---

## 🐳 For Koyeb Deployment

### Option A: Pre-Add Cookies (Recommended)

```bash
# 1. Download cookies locally
node update-cookies.js

# 2. Commit to GitHub
git add youtube_cookies.txt
git commit -m "Add YouTube cookies"
git push

# 3. Deploy to Koyeb
# Cookies will be included automatically
```

### Option B: Environment Variable

```bash
# In .env, store cookies as base64
YOUTUBE_COOKIES=$(base64 -i youtube_cookies.txt)

# In Dockerfile
RUN echo $YOUTUBE_COOKIES | base64 -d > youtube_cookies.txt
```

### Option C: Download on Container Start

Add to `docker-entrypoint.sh`:
```bash
#!/bin/bash

if [ ! -f "youtube_cookies.txt" ]; then
    echo "Downloading cookies..."
    yt-dlp --cookies-from-browser chrome "https://www.youtube.com"
fi

npm start
```

---

## 🚨 Troubleshooting

### Issue: "Cookies file not found"

**Solution 1:** Add cookies before deployment
```bash
node update-cookies.js
```

**Solution 2:** Upload manually to Koyeb
1. In Koyeb Dashboard
2. Go to your app
3. Upload youtube_cookies.txt file

**Solution 3:** Add to GitHub
```bash
git add youtube_cookies.txt
git commit -m "Add cookies"
git push
```

---

### Issue: "API returns 500 error - Failed to retrieve"

**Reason:** Cookies are outdated (>7 days old)

**Solution:**
```bash
# Update locally
node update-cookies.js

# Or manually via browser extension
# Then redeploy
```

---

### Issue: "YouTube blocks requests (403 Forbidden)"

**Reason:** Cookies are invalid or revoked

**Solution 1:** Get fresh cookies
```bash
# Delete old cookies
rm youtube_cookies.txt

# Download fresh ones
node update-cookies.js
```

**Solution 2:** Try different browser
```bash
# If Chrome doesn't work, try Firefox
yt-dlp --cookies-from-browser firefox "https://www.youtube.com"
```

**Solution 3:** Use different account
- Log out of YouTube
- Log in with different account
- Download cookies again

---

### Issue: "yt-dlp not found"

**Solution:**
```bash
# Install yt-dlp
pip install --upgrade yt-dlp

# Verify installation
yt-dlp --version
```

---

## 📊 Cookie Formats

### Netscape Format (Standard)
```
# Netscape HTTP Cookie File
.youtube.com	TRUE	/	TRUE	1744934400	VISITOR_INFO1_LIVE	abc123...
.youtube.com	TRUE	/	TRUE	1744934400	PREF	abc123...
```

**Supported by:** yt-dlp, Most tools

### Browser Storage Format
```json
{
  "cookies": [
    {
      "domain": ".youtube.com",
      "name": "VISITOR_INFO1_LIVE",
      "value": "abc123..."
    }
  ]
}
```

---

## 🔐 Security Tips

1. **Don't share cookies** - They contain authentication data
2. **Keep in .gitignore** - Don't commit to GitHub
   ```bash
   echo "youtube_cookies.txt" >> .gitignore
   git rm --cached youtube_cookies.txt
   ```

3. **Rotate cookies** - Update weekly for best results

4. **Use separate account** - Create YouTube account just for API use

5. **Monitor expiration** - Cookies expire after ~30 days

---

## 📋 Cookie File Structure

```bash
# View cookies
cat youtube_cookies.txt

# Check lines
wc -l youtube_cookies.txt

# Verify YouTube domain
grep "youtube" youtube_cookies.txt

# Check size
ls -lh youtube_cookies.txt
```

**Good file:**
- ✅ Size: 50-100 KB
- ✅ Contains "youtube" domain
- ✅ Multiple cookie entries (50+)
- ✅ Recent timestamp

---

## 🚀 Quick Checklist

- [ ] Cookies downloaded (using one of 4 methods)
- [ ] File named `youtube_cookies.txt`
- [ ] File size > 50 KB
- [ ] Contains `.youtube.com` domain
- [ ] Added to project folder
- [ ] Added to .gitignore (for local dev)
- [ ] Ready for deployment ✅

---

## 💡 Pro Tips

1. **Create backup**
   ```bash
   cp youtube_cookies.txt youtube_cookies_backup.txt
   ```

2. **Schedule auto-updates**
   ```bash
   # Add to package.json
   "scripts": {
     "update-cookies": "node update-cookies.js"
   }
   ```

3. **Monitor cookie age**
   ```bash
   # Check modification time
   stat youtube_cookies.txt
   ```

4. **Keep multiple cookies**
   ```bash
   # Use different YouTube accounts
   youtube_cookies_account1.txt
   youtube_cookies_account2.txt
   youtube_cookies_account3.txt
   ```

---

## 🎯 Recommended Workflow

### Week 1: Initial Setup
1. Download cookies using browser extension
2. Test locally: `npm start`
3. Deploy to Koyeb

### Weekly: Maintenance
1. Run: `node update-cookies.js`
2. Commit and push: `git push`
3. Redeploy on Koyeb (automatic or manual)

### If Issues Occur
1. Check cookie age: `stat youtube_cookies.txt`
2. Update if >7 days old
3. Test with: `/info` endpoint
4. Check logs in Koyeb dashboard

---

## 📞 Getting Help

**yt-dlp Documentation:**
https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-can-i-use-cookies-with-yt-dlp

**Cookie Issues:**
- Try with different browser
- Try with different YouTube account
- Wait 30 minutes then retry
- Check Koyeb logs for specific error

---

**Choose your method and get started! 🚀**
