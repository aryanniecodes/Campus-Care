const express = require("express");
const router = express.Router();
const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");

// GET /api/test/run-all
router.get("/run-all", async (req, res) => {
  try {
    // 1. Create a simple test complaint
    const complaint = new Complaint({
      title: "Test Complaint",
      description: "Testing the flow",
      category: "electrician",
      studentId: "TEST_STUDENT"
    });

    // 2. Mock Assignment logic
    const worker = await Worker.findOne({ role: "electrician", available: true });
    if (worker) {
      complaint.assignedWorker = worker._id;
      complaint.status = "assigned";
      worker.tasksAssigned += 1;
      await worker.save();
    }
    await complaint.save();

    // 3. Mark as completed
    complaint.status = "completed";
    await complaint.save();

    if (worker) {
      worker.tasksAssigned = Math.max(0, worker.tasksAssigned - 1);
      worker.available = true;
      await worker.save();
    }

    res.status(200).json({ 
      message: "Test route working",
      flow: "Full cycle simulated",
      complaintStatus: complaint.status,
      workerUpdated: !!worker
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
