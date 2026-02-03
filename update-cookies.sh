#!/bin/bash

# YouTube Cookies Auto-Download for macOS
# Run: bash update-cookies.sh

echo ""
echo "=================================================="
echo "   YouTube Cookies Auto-Download Tool (macOS)"
echo "=================================================="
echo ""

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "❌ yt-dlp is not installed!"
    echo ""
    echo "Install with:"
    echo "  brew install yt-dlp"
    echo ""
    echo "Or:"
    echo "  pip install yt-dlp"
    echo ""
    exit 1
fi

echo "✅ yt-dlp is installed"
echo ""

# Backup existing cookies
if [ -f "youtube_cookies.txt" ]; then
    echo "📋 Existing cookies found, creating backup..."
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    cp youtube_cookies.txt "youtube_cookies_backup_${TIMESTAMP}.txt"
    echo "✅ Backup created: youtube_cookies_backup_${TIMESTAMP}.txt"
    echo ""
fi

# Try different browsers
browsers=("chrome" "firefox" "safari" "chromium")

for browser in "${browsers[@]}"; do
    echo "🌐 Trying to download cookies from $browser..."
    echo ""
    
    # Try to download
    yt-dlp --cookies-from-browser "$browser" "https://www.youtube.com" 2>/dev/null
    
    # Check if cookies.txt was created
    if [ -f "cookies.txt" ]; then
        echo ""
        echo "✅ Found cookies from $browser"
        mv cookies.txt youtube_cookies.txt
        
        # Verify
        FILE_SIZE=$(wc -c < youtube_cookies.txt)
        LINE_COUNT=$(wc -l < youtube_cookies.txt)
        
        echo "✅ Cookies downloaded successfully!"
        echo ""
        echo "📊 File info:"
        echo "   File: youtube_cookies.txt"
        echo "   Size: $((FILE_SIZE / 1024)) KB"
        echo "   Lines: $LINE_COUNT"
        echo ""
        echo "✨ Cookies ready for deployment!"
        echo ""
        echo "Next steps:"
        echo "  1. Commit: git add youtube_cookies.txt"
        echo "  2. Deploy on Koyeb"
        echo ""
        exit 0
    fi
done

# If we get here, no browser worked
echo ""
echo "❌ Could not download cookies from any browser"
echo ""
echo "📋 Manual alternatives:"
echo ""
echo "Option 1: Browser Extension (Easiest)"
echo "  1. Install 'Get cookies.txt' extension from App Store"
echo "  2. Login to https://youtube.com"
echo "  3. Click extension → Export (Netscape format)"
echo "  4. Save as: youtube_cookies.txt"
echo ""
echo "Option 2: Safari Cookies"
echo "  yt-dlp --cookies-from-browser safari 'https://www.youtube.com'"
echo ""
echo "Option 3: Firefox"
echo "  brew install firefox"
echo "  yt-dlp --cookies-from-browser firefox 'https://www.youtube.com'"
echo ""
exit 1
