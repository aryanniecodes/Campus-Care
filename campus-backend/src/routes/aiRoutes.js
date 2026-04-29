const express = require("express");
const router = express.Router();
const { getSuggestion } = require("../controllers/aiController");

// POST /api/ai/suggest — Public (no auth needed for real-time typing feedback)
router.post("/suggest", getSuggestion);

module.exports = router;
