const term = require('chalk'); // We'll see if chalk is available, if not we use colors
// Since I don't know if chalk is available, I'll use standard console with prefixes

const logger = {
  info: (msg, meta = '') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ℹ️ INFO: ${msg}`, meta);
  },
  warn: (msg, meta = '') => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ⚠️ WARN: ${msg}`, meta);
  },
  error: (msg, error = '') => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ❌ ERROR: ${msg}`, error);
  },
  success: (msg, meta = '') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ✅ SUCCESS: ${msg}`, meta);
  },
  ai: (msg, meta = '') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🤖 AI-ENGINE: ${msg}`, meta);
  }
};

module.exports = logger;
