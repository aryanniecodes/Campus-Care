const isDev = process.env.NODE_ENV === "development";

const logger = {
  info: (...args) => isDev && console.log(...args),
  warn: (...args) => isDev && console.warn(...args),
  debug: (...args) => isDev && console.debug(...args),
  error: (...args) => console.error(...args),
};

module.exports = logger;
