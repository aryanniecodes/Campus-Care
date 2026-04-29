const Complaint = require("../models/Complaint");
const { generateSuggestion } = require("../services/suggestionService");

// ── POST /api/ai/suggest ────────────────────────────────────────────────────
// Input: { text: "partial complaint text" }
// Output: { detected, category, improvedDescription, prompts }
exports.getSuggestion = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 5) {
      return res.json({
        success: true,
        data: { detected: false, prompts: [] }
      });
    }

    const suggestion = generateSuggestion(text);

    res.json({ success: true, data: suggestion });
  } catch (error) {
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
