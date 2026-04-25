const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");

// 1. Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .select("title description category status assignedWorker createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { complaints }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Get All Workers
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
      .select("name role tasksAssigned available");

    res.status(200).json({
      success: true,
      data: { workers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
