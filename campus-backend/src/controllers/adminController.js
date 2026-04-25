const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");

// 1. Get All Complaints
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .select("title description category status assignedWorker createdAt")
      .sort({ createdAt: -1 });

    console.log(`Admin: Found ${complaints.length} complaints`);

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: error.message });
  }
};

// 2. Get All Workers
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find()
      .select("name role tasksAssigned available");

    console.log(`Admin: Found ${workers.length} workers`);

    res.status(200).json({ workers });
  } catch (error) {
    console.error("Error fetching workers:", error);
    res.status(500).json({ message: error.message });
  }
};
