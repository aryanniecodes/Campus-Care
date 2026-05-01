const Complaint = require("../models/Complaint");
const { generateSuggestion } = require("../services/suggestionService");
const axios = require("axios");
const logger = require("../utils/logger");

let hasLoggedFallbackWarning = false;

// ── POST /api/ai/suggest ────────────────────────────────────────────────────
exports.getSuggestion = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 3) {
      return res.json({
        success: true,
        data: { detected: false, suggestions: "", prompts: [] }
      });
    }

    let suggestion;
    try {
      // 1. Try calling FastAPI service
      const aiResponse = await axios.post("http://localhost:8000/suggest", { text }, { timeout: 3000 });
      
      const hasSuggestions = aiResponse.data && aiResponse.data.suggestions && aiResponse.data.suggestions.length > 0;

      if (!aiResponse.data || aiResponse.data.success === false || !hasSuggestions) {
        throw new Error("Empty or unsuccessful response from AI");
      }

      const { suggestions = [], category = "" } = aiResponse.data;
      
      suggestion = {
        detected: true,
        category: category,
        suggestions: suggestions[0] || "Please provide more details about the issue.",
        prompts: suggestions
      };
    } catch (aiError) {
      // 2. Meaningful fallback if AI fails or is empty
      const fallbackText = "Please describe the issue clearly, include location and specific problem details.";
      
      suggestion = {
        detected: false,
        category: null,
        suggestions: fallbackText,
        prompts: [fallbackText]
      };
    }

    res.json({ 
      success: true, 
      suggestions: suggestion.suggestions, // Normalized top-level for Task 2
      data: suggestion 
    });
  } catch (error) {
    logger.error("[AI] Error in getSuggestion:", error.message);
    res.status(200).json({ 
      success: true, 
      suggestions: "Please describe the issue clearly, include location and specific problem details." 
    });
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

    // 1. Call FastAPI service with 3s timeout
    const aiResponse = await axios.post("http://localhost:8000/improve-description", {
      title,
      description
    }, { timeout: 3000 });

    if (!aiResponse.data || aiResponse.data.success === false) {
      throw new Error("FastAPI returned unsuccessful status");
    }

    res.json({ success: true, improvedText: aiResponse.data.improvedText });
  } catch (error) {
    if (!hasLoggedFallbackWarning) {
      logger.warn(`[AI] FastAPI improve-description unavailable. (${error.message})`);
      hasLoggedFallbackWarning = true;
    }
    // 2. Simple fallback if AI service fails
    res.json({ 
      success: true, 
      improvedText: `${req.body.description}. This issue regarding ${req.body.title} needs urgent attention.` 
    });
  }
};
