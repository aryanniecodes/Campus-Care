const Complaint = require("../models/Complaint");
const { generateSuggestion } = require("../services/suggestionService");
const axios = require("axios");

// ── POST /api/ai/suggest ────────────────────────────────────────────────────
// Input: { text: "partial complaint text" }
// Output: { detected, category, improvedDescription, prompts }
exports.getSuggestion = async (req, res) => {
  try {
    const { text } = req.body;

    console.log(`[AI] Request received for text: "${text}"`);

    if (!text || text.trim().length < 5) {
      return res.json({
        success: true,
        data: { detected: false, prompts: [] }
      });
    }

    let suggestion;
    try {
      // Try calling FastAPI service
      const aiResponse = await axios.post("http://localhost:8000/suggest", { text });
      console.log("[AI] FastAPI Response:", aiResponse.data);
      
      const { suggestions, category } = aiResponse.data;
      
      suggestion = {
        detected: true,
        category: category,
        improvedDescription: `There is a ${category} issue: ${text}. Please investigate.`,
        prompts: suggestions
      };
    } catch (aiError) {
      console.warn("[AI] FastAPI service unavailable, using local fallback.", aiError.message);
      // Fallback to local rule-based service
      suggestion = generateSuggestion(text);
    }

    res.json({ success: true, data: suggestion });
  } catch (error) {
    console.error("[AI] Error in getSuggestion:", error);
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
