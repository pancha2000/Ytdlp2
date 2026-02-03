/**
 * Example: How to integrate YouTube API with your WhatsApp Bot
 * This shows the integration pattern - adapt to your bot framework
 */

const axios = require('axios');

// Configuration
const CONFIG = {
  API_URL: process.env.YOUTUBE_API_URL || 'https://your-api.koyeb.sh',
  API_KEY: process.env.YOUTUBE_API_KEY, // Generated from /generate-key
  TIMEOUT: {
    AUDIO: 50000,
    VIDEO: 60000,
    INFO: 30000
  }
};

/**
 * YouTube API Client
 */
class YouTubeClient {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
  }

  /**
   * Get audio URL
   */
  async getAudio(youtubeUrl) {
    try {
      const response = await axios.get(`${this.apiUrl}/audio`, {
        params: {
          url: youtubeUrl,
          key: this.apiKey
        },
        timeout: CONFIG.TIMEOUT.AUDIO
      });

      if (!response.data.audio_url) {
        throw new Error('No audio URL returned');
      }

      return {
        success: true,
        url: response.data.audio_url,
        cached: response.data.cached || false
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
        cached: false
      };
    }
  }

  /**
   * Get video URL
   */
  async getVideo(youtubeUrl) {
    try {
      const response = await axios.get(`${this.apiUrl}/video`, {
        params: {
          url: youtubeUrl,
          key: this.apiKey
        },
        timeout: CONFIG.TIMEOUT.VIDEO
      });

      if (!response.data.video_url) {
        throw new Error('No video URL returned');
      }

      return {
        success: true,
        url: response.data.video_url,
        cached: response.data.cached || false
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
        cached: false
      };
    }
  }

  /**
   * Get video info
   */
  async getInfo(youtubeUrl) {
    try {
      const response = await axios.get(`${this.apiUrl}/info`, {
        params: {
          url: youtubeUrl,
          key: this.apiKey
        },
        timeout: CONFIG.TIMEOUT.INFO
      });

      return {
        success: true,
        data: response.data,
        cached: response.data.cached || false
      };
    } catch (error) {
      return {
        success: false,
        error: this.parseError(error),
        cached: false
      };
    }
  }

  /**
   * Parse error message
   */
  parseError(error) {
    if (error.response?.status === 401) {
      return 'Missing API key';
    } else if (error.response?.status === 403) {
      return 'Invalid API key';
    } else if (error.response?.status === 400) {
      return 'Invalid YouTube URL';
    } else if (error.response?.status === 500) {
      return 'API Server error - try again later';
    } else if (error.response?.status === 504) {
      return 'Request timeout - YouTube is slow, retry in 30s';
    } else if (error.code === 'ECONNABORTED') {
      return 'Request timeout';
    } else if (error.code === 'ECONNREFUSED') {
      return 'API server is not responding';
    } else {
      return error.message || 'Unknown error';
    }
  }
}

// Initialize client
const youtubeClient = new YouTubeClient(CONFIG.API_URL, CONFIG.API_KEY);

// ============================================
// INTEGRATION EXAMPLES FOR YOUR BOT
// ============================================

/**
 * Example 1: With WhatsApp-Web.js
 */
async function whatsappBotExample(client) {
  client.on('message', async (message) => {
    const text = message.body.trim();

    // !audio <url>
    if (text.startsWith('!audio ')) {
      const url = text.replace('!audio', '').trim();
      const statusMsg = await message.reply('⏳ Downloading audio...');

      const result = await youtubeClient.getAudio(url);
      await statusMsg.delete();

      if (result.success) {
        await message.reply(`🎵 Audio URL:\n${result.url}`);
      } else {
        await message.reply(`❌ Error: ${result.error}`);
      }
    }

    // !video <url>
    else if (text.startsWith('!video ')) {
      const url = text.replace('!video', '').trim();
      const statusMsg = await message.reply('⏳ Downloading video...');

      const result = await youtubeClient.getVideo(url);
      await statusMsg.delete();

      if (result.success) {
        await message.reply(`🎥 Video URL:\n${result.url}`);
      } else {
        await message.reply(`❌ Error: ${result.error}`);
      }
    }

    // !info <url>
    else if (text.startsWith('!info ')) {
      const url = text.replace('!info', '').trim();
      const result = await youtubeClient.getInfo(url);

      if (result.success) {
        const info = result.data;
        const infoText = `📊 Video Info\n\n` +
          `Title: ${info.title}\n` +
          `Duration: ${Math.floor(info.duration / 60)}:${String(info.duration % 60).padStart(2, '0')}\n` +
          `Uploader: ${info.uploader}\n` +
          `Formats: ${info.formats}`;

        await message.reply(infoText);
      } else {
        await message.reply(`❌ Error: ${result.error}`);
      }
    }
  });
}

/**
 * Example 2: With Express.js (for webhook-based bots)
 */
async function expressWebhookExample(app) {
  app.post('/webhook/youtube', async (req, res) => {
    const { action, url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Missing URL' });
    }

    try {
      let result;

      if (action === 'audio') {
        result = await youtubeClient.getAudio(url);
      } else if (action === 'video') {
        result = await youtubeClient.getVideo(url);
      } else if (action === 'info') {
        result = await youtubeClient.getInfo(url);
      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}

/**
 * Example 3: With Telegram Bot
 */
async function telegramBotExample(bot) {
  // Telegram command: /audio https://youtube.com/watch?v=xxx
  bot.onText(/\/audio (.+)/, async (msg, match) => {
    const url = match[1];
    const chatId = msg.chat.id;

    const statusMsg = await bot.sendMessage(chatId, '⏳ Downloading...');
    const result = await youtubeClient.getAudio(url);

    await bot.deleteMessage(chatId, statusMsg.message_id);

    if (result.success) {
      await bot.sendMessage(chatId, `🎵 Audio:\n${result.url}`);
    } else {
      await bot.sendMessage(chatId, `❌ ${result.error}`);
    }
  });

  // Telegram command: /video https://youtube.com/watch?v=xxx
  bot.onText(/\/video (.+)/, async (msg, match) => {
    const url = match[1];
    const chatId = msg.chat.id;

    const statusMsg = await bot.sendMessage(chatId, '⏳ Downloading...');
    const result = await youtubeClient.getVideo(url);

    await bot.deleteMessage(chatId, statusMsg.message_id);

    if (result.success) {
      await bot.sendMessage(chatId, `🎥 Video:\n${result.url}`);
    } else {
      await bot.sendMessage(chatId, `❌ ${result.error}`);
    }
  });
}

/**
 * Example 4: Utility function for any bot
 */
async function processYouTubeRequest(url, type) {
  // Validate URL
  try {
    new URL(url);
  } catch (e) {
    return { success: false, error: 'Invalid URL format' };
  }

  // Get URL
  let result;
  if (type === 'audio') {
    result = await youtubeClient.getAudio(url);
  } else if (type === 'video') {
    result = await youtubeClient.getVideo(url);
  } else if (type === 'info') {
    result = await youtubeClient.getInfo(url);
  } else {
    return { success: false, error: 'Invalid type' };
  }

  return result;
}

/**
 * Example 5: With retry logic
 */
async function getAudioWithRetry(url, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await youtubeClient.getAudio(url);

    if (result.success) {
      return result;
    }

    // Retry if timeout
    if (result.error.includes('timeout') && attempt < maxAttempts) {
      console.log(`Retry ${attempt}/${maxAttempts}...`);
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
      continue;
    }

    return result;
  }
}

/**
 * Example 6: Check API health
 */
async function checkApiHealth() {
  try {
    const response = await axios.get(`${CONFIG.API_URL}/health`, {
      timeout: 5000
    });
    return {
      status: 'online',
      data: response.data
    };
  } catch (error) {
    return {
      status: 'offline',
      error: error.message
    };
  }
}

// ============================================
// EXPORT FOR USE IN YOUR BOT
// ============================================

module.exports = {
  youtubeClient,
  processYouTubeRequest,
  getAudioWithRetry,
  checkApiHealth,
  CONFIG,

  // Direct functions
  getAudio: (url) => youtubeClient.getAudio(url),
  getVideo: (url) => youtubeClient.getVideo(url),
  getInfo: (url) => youtubeClient.getInfo(url),

  // Example implementations
  whatsappBotExample,
  expressWebhookExample,
  telegramBotExample
};

// ============================================
// QUICK START (for testing)
// ============================================

if (require.main === module) {
  (async () => {
    console.log('Testing YouTube API integration...\n');

    // Check health
    const health = await checkApiHealth();
    console.log('API Health:', health);

    // Test audio
    const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    console.log('\nTesting audio download...');
    const audioResult = await youtubeClient.getAudio(testUrl);
    console.log('Audio result:', audioResult.success ? '✅ Success' : `❌ ${audioResult.error}`);

    // Test video
    console.log('\nTesting video download...');
    const videoResult = await youtubeClient.getVideo(testUrl);
    console.log('Video result:', videoResult.success ? '✅ Success' : `❌ ${videoResult.error}`);

    // Test info
    console.log('\nTesting video info...');
    const infoResult = await youtubeClient.getInfo(testUrl);
    console.log('Info result:', infoResult.success ? '✅ Success' : `❌ ${infoResult.error}`);
    if (infoResult.success) {
      console.log(`  Title: ${infoResult.data.title}`);
    }
  })();
}
