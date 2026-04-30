const Complaint = require("../models/Complaint");
const { generateSuggestion } = require("../services/suggestionService");
const axios = require("axios");
const logger = require("../utils/logger");

let hasLoggedFallbackWarning = false;

// ── POST /api/ai/suggest ────────────────────────────────────────────────────
// Input: { text: "partial complaint text" }
// Output: { detected, category, improvedDescription, prompts }
exports.getSuggestion = async (req, res) => {
  try {
    const { text } = req.body;

    logger.debug(`[AI] Request received for text: "${text}"`);

    if (!text || text.trim().length < 5) {
      return res.json({
        success: true,
        data: { detected: false, prompts: [] }
      });
    }

    let suggestion;
    try {
      // Try calling FastAPI service
      const aiResponse = await axios.post("http://localhost:8000/suggest", { text }, { timeout: 3000 });
      logger.debug("[AI] FastAPI Response:", aiResponse.data);
      
      const { suggestions = [], category = "" } = aiResponse.data;
      
      suggestion = {
        detected: true,
        category: category,
        improvedDescription: `There is a ${category} issue: ${text}. Please investigate.`,
        prompts: suggestions
      };
    } catch (aiError) {
      if (!hasLoggedFallbackWarning) {
        logger.warn("[AI] FastAPI service unavailable, using local fallback. Error:", aiError.message);
        hasLoggedFallbackWarning = true; // Prevent spam
      }
      // Fallback to local rule-based service
      suggestion = generateSuggestion(text);
    }

    res.json({ success: true, data: suggestion });
  } catch (error) {
    logger.error("[AI] Error in getSuggestion:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── GET /api/complaints/:id/similar ────────────────────────────────────────
// Returns other complaints from the same cluster
exports.getSimilarComplaints = async (req, res) => {
  try {
    const { id } = req.params;

    const source = await Complaint.findById(id).select("clusterId title").lean();

    if (!source?.clusterId) {
      return res.json({ success: true, data: [] });
    }

    const similar = await Complaint.find({
      clusterId: source.clusterId,
      _id: { $ne: id }
    })
    .select("title category status createdAt priority")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    res.json({ success: true, data: similar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ── POST /api/ai/improve-description ──────────────────────────────────────
exports.improveDescription = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and description are required" });
    }

    logger.debug(`[AI] Improving description for: "${title}"`);

    // Call FastAPI service
    const aiResponse = await axios.post("http://localhost:8000/improve-description", {
      title,
      description
    }, { timeout: 3000 });

    res.json({ success: true, improvedText: aiResponse.data.improvedText });
  } catch (error) {
    if (!hasLoggedFallbackWarning) {
      logger.warn("[AI] FastAPI improve-description unavailable, using local fallback. Error:", error.message);
      hasLoggedFallbackWarning = true;
    }
    // Simple fallback if AI service fails
    res.json({ 
      success: true, 
      improvedText: `${req.body.description}. This issue regarding ${req.body.title} needs urgent attention.` 
    });
  }
};
