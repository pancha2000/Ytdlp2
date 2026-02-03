#!/bin/bash

# Docker Entrypoint Script
# Handles cookie updates and server startup

echo "🎬 Starting YouTube API Server..."

# Check if cookies exist
if [ ! -f "youtube_cookies.txt" ] && [ ! -f "cookies.txt" ]; then
    echo "⚠️  Cookies file not found!"
    echo ""
    echo "📋 Cookie options:"
    echo "1. Add youtube_cookies.txt before deployment"
    echo "2. Run update-cookies.js locally first"
    echo "3. Use pre-downloaded cookies in .env"
    echo ""
    echo "⏳ Starting server anyway (requests may fail without cookies)..."
else
    echo "✅ Cookies file found"
    
    # Show cookie age if available
    if [ -f "youtube_cookies.txt" ]; then
        COOKIE_SIZE=$(wc -c < youtube_cookies.txt)
        echo "   Size: $((COOKIE_SIZE / 1024)) KB"
    fi
fi

echo ""
echo "🚀 Starting server on port ${PORT:-3000}..."
echo ""

# Start the application
npm start
