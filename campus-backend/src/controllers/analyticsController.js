const Complaint = require("../models/Complaint");

// GET /api/analytics/summary
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate("assignedWorker", "name");

    const total = complaints.length;
    const completed = complaints.filter(c => c.status === "completed").length;
    const pending = complaints.filter(c => c.status !== "completed").length;

    // Category breakdown
    const categories = {};
    complaints.forEach(c => {
      categories[c.category] = (categories[c.category] || 0) + 1;
    });

    // Worker performance
    const workerStats = {};
    complaints.forEach(c => {
      if (c.assignedWorker && c.assignedWorker.name) {
        const workerName = c.assignedWorker.name;
        workerStats[workerName] = (workerStats[workerName] || 0) + (c.status === "completed" ? 1 : 0);
      }
    });

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        categories,
        workerStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
