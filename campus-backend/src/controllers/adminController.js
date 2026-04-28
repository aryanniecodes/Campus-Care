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

// GET DASHBOARD SUMMARY (Admin)
exports.getDashboardSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: "pending" });
    const completed = await Complaint.countDocuments({ status: "completed" });

    const workers = await Worker.find();

    const leaderboard = await Promise.all(
      workers.map(async (w) => {
        const comp = await Complaint.countDocuments({
          assignedWorker: w._id,
          status: "completed"
        });

        const assigned = await Complaint.countDocuments({
          assignedWorker: w._id,
          status: { $ne: "completed" }
        });

        return {
          name: w.name,
          workerId: w.workerId,
          completed: comp,
          assigned,
          available: w.available
        };
      })
    );

    res.json({
      success: true,
      data: { 
        total, 
        pending, 
        completed, 
        leaderboard,
        avgRating: 4.5 // placeholder if not calculated
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
