const express = require("express");
const router = express.Router();
const { getSuggestion, improveDescription } = require("../controllers/aiController");

// POST /api/ai/suggest — Public (no auth needed for real-time typing feedback)
router.post("/suggest", getSuggestion);

// POST /api/ai/improve-description — Public
router.post("/improve-description", improveDescription);

module.exports = router;
