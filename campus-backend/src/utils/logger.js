const isDev = process.env.NODE_ENV === 'development';

const logger = {
  info: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // Always log errors, even in production
    console.error(...args);
  },
  debug: (...args) => {
    if (isDev) {
      console.debug(...args);
    }
  }
};

module.exports = logger;
