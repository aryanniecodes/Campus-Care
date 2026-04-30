const mongoose = require("mongoose");

const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("[DB] MongoDB Connected successfully");
  } catch (error) {
    logger.error("[DB] MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;