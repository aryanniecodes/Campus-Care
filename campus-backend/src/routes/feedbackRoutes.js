const express = require("express");
const router = express.Router();
const { giveFeedback } = require("../controllers/feedbackController");

// POST /api/feedback
router.post("/", giveFeedback);

module.exports = router;
