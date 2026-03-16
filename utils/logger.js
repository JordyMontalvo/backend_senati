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
  },
  debug: (msg, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🔍 DEBUG: ${msg}`, meta);
    }
  }
};

module.exports = logger;
