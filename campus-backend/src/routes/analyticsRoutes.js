const express = require("express");
const router = express.Router();
const { getAnalyticsSummary } = require("../controllers/analyticsController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

// GET /api/analytics/summary
router.get("/summary", protect, adminOnly, getAnalyticsSummary);

module.exports = router;
