const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logger.error(`[ERROR] ${err.name}: ${err.message}`);
  logger.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "development" ? message : "An unexpected error occurred",
  });
};

module.exports = errorHandler;
