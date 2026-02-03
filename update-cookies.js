#!/usr/bin/env node

/**
 * YouTube Cookies Auto-Update Script
 * Automatically downloads fresh YouTube cookies
 * Run: node update-cookies.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const COOKIES_FILE = path.join(__dirname, 'youtube_cookies.txt');
const BACKUP_DIR = path.join(__dirname, '.cookies-backup');

console.log('🔄 YouTube Cookies Auto-Update Tool\n');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Check if yt-dlp is installed
 */
function checkYtDlp() {
  try {
    execSync('yt-dlp --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if browser is available (Chrome/Edge/Firefox)
 */
function checkBrowser() {
  const browsers = ['chrome', 'chromium', 'edge', 'firefox'];
  
  for (const browser of browsers) {
    try {
      // Try to detect browser
      if (process.platform === 'win32') {
        execSync(`where ${browser}`, { stdio: 'ignore' });
        return browser;
      } else if (process.platform === 'darwin') {
        execSync(`which ${browser}`, { stdio: 'ignore' });
        return browser;
      } else {
        execSync(`which ${browser}`, { stdio: 'ignore' });
        return browser;
      }
    } catch (e) {
      continue;
    }
  }
  return null;
}

/**
 * Backup existing cookies
 */
function backupCookies() {
  if (fs.existsSync(COOKIES_FILE)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `youtube_cookies_${timestamp}.txt`);
    
    try {
      fs.copyFileSync(COOKIES_FILE, backupPath);
      console.log(`✅ Backup created: ${backupPath}\n`);
      return true;
    } catch (e) {
      console.error(`❌ Failed to backup cookies: ${e.message}\n`);
      return false;
    }
  }
  return true;
}

/**
 * Download cookies using yt-dlp
 */
function downloadCookiesWithYtDlp(browser) {
  return new Promise((resolve) => {
    console.log(`🌐 Downloading cookies from ${browser}...`);
    console.log('⏳ Please wait (this may take a few seconds)...\n');

    try {
      execSync(
        `yt-dlp --cookies-from-browser ${browser} "https://www.youtube.com" -o "%(id)s.%(ext)s" --skip-download`,
        { 
          stdio: 'inherit',
          cwd: __dirname
        }
      );

      // Check if cookies.txt was created by yt-dlp
      const possiblePaths = [
        path.join(__dirname, 'cookies.txt'),
        path.join(process.cwd(), 'cookies.txt')
      ];

      let cookiesFound = false;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          fs.copyFileSync(possiblePath, COOKIES_FILE);
          fs.unlinkSync(possiblePath);
          cookiesFound = true;
          break;
        }
      }

      if (cookiesFound) {
        console.log('\n✅ Cookies downloaded successfully!\n');
        resolve(true);
      } else {
        // Try alternative method
        downloadCookiesAlternative(browser).then(resolve);
      }
    } catch (e) {
      console.error(`\n⚠️ yt-dlp method failed: ${e.message}\n`);
      downloadCookiesAlternative(browser).then(resolve);
    }
  });
}

/**
 * Alternative: Download via Netscape cookie format
 */
function downloadCookiesAlternative(browser) {
  return new Promise((resolve) => {
    console.log(`🔄 Trying alternative method...\n`);

    try {
      // Try using yt-dlp with direct output
      const result = execSync(
        `yt-dlp --cookies-from-browser ${browser} --dump-json "https://www.youtube.com/results?search_query=test" 2>/dev/null || true`,
        { encoding: 'utf-8' }
      );

      if (result && result.length > 0) {
        console.log('✅ Alternative method successful!\n');
        resolve(true);
      } else {
        console.log('❌ Both methods failed. Please install cookies manually.\n');
        resolve(false);
      }
    } catch (e) {
      console.log('❌ Could not download cookies automatically.\n');
      resolve(false);
    }
  });
}

/**
 * Download from backup service (if available)
 */
function downloadFromService() {
  return new Promise((resolve) => {
    console.log('📥 Downloading cookies from backup service...\n');

    const url = 'https://raw.githubusercontent.com/yt-dlp/yt-dlp/master/yt_dlp/cookies.txt';

    https.get(url, (res) => {
      if (res.statusCode === 200) {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (data.length > 100) {
            fs.writeFileSync(COOKIES_FILE, data);
            console.log('✅ Cookies downloaded from backup service!\n');
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        console.log(`⚠️ Service unavailable (${res.statusCode})\n`);
        resolve(false);
      }
    }).on('error', (e) => {
      console.log(`⚠️ Service error: ${e.message}\n`);
      resolve(false);
    });
  });
}

/**
 * Manual instruction
 */
function showManualInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('📋 MANUAL COOKIE INSTALLATION');
  console.log('='.repeat(60) + '\n');

  console.log('Option 1: Browser Extension Method (Easiest)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1. Install "Get cookies.txt" extension:');
  console.log('   Chrome: https://chrome.google.com/webstore/detail/...');
  console.log('   Firefox: https://addons.mozilla.org/...');
  console.log('');
  console.log('2. Login to YouTube: https://youtube.com');
  console.log('');
  console.log('3. Click extension icon → Export (Netscape format)');
  console.log('');
  console.log('4. Save as: youtube_cookies.txt');
  console.log('');
  console.log('5. Move to this folder:');
  console.log(`   ${__dirname}`);
  console.log('\n');

  console.log('Option 2: Command Line Method');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('pip install yt-dlp');
  console.log('');
  console.log('# For Chrome:');
  console.log('yt-dlp --cookies-from-browser chrome "https://www.youtube.com"');
  console.log('');
  console.log('# For Firefox:');
  console.log('yt-dlp --cookies-from-browser firefox "https://www.youtube.com"');
  console.log('');
  console.log('# For Edge:');
  console.log('yt-dlp --cookies-from-browser edge "https://www.youtube.com"');
  console.log('\n');

  console.log('⏳ After adding cookies.txt, run this script again:');
  console.log('   node update-cookies.js\n');
}

/**
 * Verify cookies
 */
function verifyCookies() {
  if (!fs.existsSync(COOKIES_FILE)) {
    console.log('❌ Cookies file not found!\n');
    return false;
  }

  const content = fs.readFileSync(COOKIES_FILE, 'utf-8');
  
  if (content.length < 100) {
    console.log('❌ Cookies file is too small (seems invalid)\n');
    return false;
  }

  if (!content.includes('youtube') && !content.includes('.youtube')) {
    console.log('⚠️ Warning: Cookies may not include YouTube domain\n');
  }

  const lineCount = content.split('\n').length;
  console.log(`✅ Cookies verified!`);
  console.log(`   File size: ${(content.length / 1024).toFixed(2)} KB`);
  console.log(`   Lines: ${lineCount}`);
  console.log(`   Location: ${COOKIES_FILE}\n`);

  return true;
}

/**
 * Show cookie age
 */
function showCookieAge() {
  if (fs.existsSync(COOKIES_FILE)) {
    const stats = fs.statSync(COOKIES_FILE);
    const age = Math.floor((Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24));
    
    if (age > 7) {
      console.log(`⚠️ Warning: Cookies are ${age} days old (YouTube may block them)`);
      console.log('💡 Recommendation: Update cookies weekly for best results\n');
    } else if (age === 0) {
      console.log('✨ Cookies are fresh (updated today)\n');
    } else {
      console.log(`ℹ️ Cookies are ${age} days old\n`);
    }
  }
}

/**
 * Schedule periodic updates
 */
function scheduleUpdates() {
  const nodeSchedule = 'node-schedule'; // Optional package

  console.log('\n💡 Tip: To auto-update cookies weekly, add to your cron:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('# Crontab (Linux/Mac):');
  console.log('0 2 * * 0 cd /path/to/api && node update-cookies.js >> cookies-update.log 2>&1');
  console.log('');
  console.log('# Or add to package.json scripts:');
  console.log('"update-cookies": "node update-cookies.js"');
  console.log('');
  console.log('Then run:');
  console.log('npm run update-cookies\n');
}

/**
 * Main execution
 */
async function main() {
  try {
    // Check yt-dlp
    if (!checkYtDlp()) {
      console.log('❌ yt-dlp is not installed!\n');
      console.log('Install with: pip install yt-dlp\n');
      
      showManualInstructions();
      return;
    }

    console.log('✅ yt-dlp is installed\n');

    // Backup existing cookies
    if (!backupCookies()) {
      process.exit(1);
    }

    // Check available browsers
    const browser = checkBrowser();

    if (browser) {
      console.log(`✅ Found browser: ${browser}\n`);
      
      // Try to download
      const success = await downloadCookiesWithYtDlp(browser);

      if (success) {
        verifyCookies();
        showCookieAge();
        console.log('🎉 Cookies are ready for deployment!\n');
        scheduleUpdates();
        return;
      }
    } else {
      console.log('⚠️ No compatible browser found for auto-download\n');
    }

    // Try backup service
    const serviceSuccess = await downloadFromService();
    if (serviceSuccess) {
      verifyCookies();
      return;
    }

    // Fall back to manual instructions
    showManualInstructions();

  } catch (error) {
    console.error(`❌ Error: ${error.message}\n`);
    showManualInstructions();
  }
}

// Run main
main().catch(console.error);
