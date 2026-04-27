const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");

// GET ALL WORKERS (Admin)
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().select("-password");
    res.json({ success: true, data: workers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL COMPLAINTS (Admin - legacy route)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("assignedTo", "name workerId")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET DASHBOARD STATS (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "pending" });
    const completed = await Complaint.countDocuments({ status: "completed" });

    res.json({
      success: true,
      data: { total, pending, completed }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
