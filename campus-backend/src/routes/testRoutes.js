const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Student = require("../models/Student");
const Worker = require("../models/Worker");
const Complaint = require("../models/Complaint");
const Feedback = require("../models/Feedback");

router.get("/run-all", async (req, res) => {
  const results = {
    auth: "failed",
    complaint: "failed",
    worker: "failed",
    feedback: "failed",
    admin: "failed"
  };

  try {
    console.log("--- Starting Master Test Run ---");

    // 1. Auth System Test
    await Student.deleteMany({ rollNo: "T001" });
    await Worker.deleteMany({ workerId: "TW01" });

    const hashedPassword = await bcrypt.hash("123456", 10);
    const student = new Student({ rollNo: "T001", name: "Test Student", email: "student@test.com", password: hashedPassword });
    await student.save();
    console.log("Step 1: Test Student registered");

    const worker = new Worker({ workerId: "TW01", name: "Test Worker", email: "worker@test.com", role: "electrician", password: hashedPassword });
    await worker.save();
    console.log("Step 2: Test Worker registered");

    results.auth = "passed";

    // 2. Complaint Flow Test
    const complaint = new Complaint({
      title: "Test: Fan Broken",
      description: "Testing automated flow",
      category: "electrician",
      studentId: "T001"
    });

    const availableWorker = await Worker.findOne({ role: "electrician", available: true, tasksAssigned: { $lt: 5 } });
    if (availableWorker) {
      complaint.assignedWorker = availableWorker._id;
      complaint.status = "assigned";
      availableWorker.tasksAssigned += 1;
      await availableWorker.save();
      console.log("Step 3: Complaint assigned to worker:", availableWorker.name);
    }
    await complaint.save();
    results.complaint = availableWorker ? "passed" : "failed (no worker found)";

    // 3. Worker Flow Test
    if (complaint.assignedWorker) {
      complaint.status = "completed";
      await complaint.save();

      const w = await Worker.findById(complaint.assignedWorker);
      w.tasksAssigned = Math.max(0, w.tasksAssigned - 1);
      w.available = true;
      await w.save();
      console.log("Step 4: Task marked complete and worker status reset");
      results.worker = "passed";
    }

    // 4. Feedback System Test
    const feedback = new Feedback({
      complaintId: complaint._id,
      studentId: "T001",
      rating: 5,
      feedback: "Verified flow works!"
    });
    await feedback.save();

    complaint.status = "closed";
    await complaint.save();
    console.log("Step 5: Feedback added and complaint closed");
    results.feedback = "passed";

    // 5. Admin System Test
    const adminCheckComplaints = await Complaint.find().limit(1);
    const adminCheckWorkers = await Worker.find().limit(1);
    if (adminCheckComplaints.length > 0 && adminCheckWorkers.length > 0) {
      console.log("Step 6: Admin data access verified");
      results.admin = "passed";
    }

    console.log("--- Master Test Run Complete ---");
    res.status(200).json({ 
      status: "Test completed successfully",
      results 
    });

  } catch (error) {
    console.error("Master Test Error:", error);
    res.status(500).json({ 
      status: "Test failed with error",
      results,
      error: error.message 
    });
  }
});

module.exports = router;
