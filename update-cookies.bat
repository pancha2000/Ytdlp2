@echo off
REM YouTube Cookies Auto-Download for Windows
REM Run this to automatically download YouTube cookies

echo.
echo ==================================================
echo   YouTube Cookies Auto-Download Tool (Windows)
echo ==================================================
echo.

REM Check if yt-dlp is installed
where yt-dlp >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] yt-dlp is not installed!
    echo.
    echo Install yt-dlp with:
    echo   pip install yt-dlp
    echo.
    pause
    exit /b 1
)

echo [OK] yt-dlp is installed
echo.

REM Check if cookies file exists
if exist "youtube_cookies.txt" (
    echo [INFO] Existing cookies found, creating backup...
    for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
    for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
    copy youtube_cookies.txt youtube_cookies_backup_%mydate%_%mytime%.txt
    echo [OK] Backup created
    echo.
)

REM Try different browsers
setlocal enabledelayedexpansion

set browsers=chrome edge firefox chromium

for %%b in (%browsers%) do (
    echo [INFO] Trying to download cookies from %%b...
    echo.
    
    yt-dlp --cookies-from-browser %%b "https://www.youtube.com"
    
    if exist "cookies.txt" (
        echo.
        echo [OK] Found cookies from %%b
        copy cookies.txt youtube_cookies.txt
        del cookies.txt
        
        REM Verify
        for /f %%z in ('dir /b youtube_cookies.txt ^| find /v /n ""') do (
            set filesize=0
        )
        
        echo [OK] Cookies downloaded successfully!
        echo [INFO] File: youtube_cookies.txt
        
        REM Show file info
        for %%f in (youtube_cookies.txt) do (
            echo [INFO] Size: %%~zf bytes
        )
        
        echo.
        echo [SUCCESS] Cookies ready for deployment!
        echo.
        echo Next steps:
        echo   1. Commit to GitHub: git add youtube_cookies.txt
        echo   2. Deploy on Koyeb
        echo.
        pause
        exit /b 0
    )
)

REM If we get here, no browser worked
echo.
echo [ERROR] Could not download cookies from any browser
echo.
echo Manual alternatives:
echo   1. Browser Extension:
echo      - Install "Get cookies.txt" extension
echo      - Login to YouTube
echo      - Export as Netscape format
echo.
echo   2. Command line with manual copy:
echo      - Save youtube_cookies.txt to this folder
echo.
echo   3. Try a different browser next time
echo.
pause
exit /b 1
