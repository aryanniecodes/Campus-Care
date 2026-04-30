require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const workerRoutes = require("./routes/workerRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");

connectDB();


const app = express();

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// ─── API Routes ────────────────────────────────────────────────────────────────
// Auth routes are PUBLIC — no protect middleware here
app.use("/api/auth", authRoutes);

// Resource routes apply protect per-route inside their own route files
app.use("/api/complaints", complaintRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/", (req, res) => {
  res.json({ success: true, message: "CampusCare API is running" });
});

const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Server ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`[SERVER] Running on port ${PORT}`);
});

// ─── Process Level Error Handling ──────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  logger.error("[PROCESS] Unhandled Promise Rejection:", err.message || err);
  // Do not exit process immediately in dev, but generally safe to exit and let PM2 restart in prod
});

process.on("uncaughtException", (err) => {
  logger.error("[PROCESS] Uncaught Exception:", err.message || err);
  // Important to exit on uncaughtException to prevent unstable state
  process.exit(1);
});