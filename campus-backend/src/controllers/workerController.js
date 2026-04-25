const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");

// 1. Get Assigned Tasks
exports.getWorkerTasks = async (req, res) => {
  try {
    const { workerId } = req.params;

    const tasks = await Complaint.find({ assignedWorker: workerId })
      .select("title description status category image createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Mark Task Complete
exports.completeTask = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Safety Check: Ensure worker is assigned
    if (!complaint.assignedWorker) {
      return res.status(400).json({ message: "No worker assigned to this complaint" });
    }

    complaint.status = "completed";
    await complaint.save();

    const worker = await Worker.findById(complaint.assignedWorker);
    if (worker) {
      worker.tasksAssigned = Math.max(0, worker.tasksAssigned - 1);
      worker.available = true;
      await worker.save();
    }

    // Send email notification to student
    const student = await Student.findOne({ rollNo: complaint.studentId });
    if (student && student.email) {
      sendEmail(
        student.email,
        "Task Completed",
        "Your complaint has been resolved"
      );
    }

    res.status(200).json({
      message: "Task marked as completed",
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Toggle Availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId).select("-password");
    
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }
    
    worker.available = !worker.available;
    await worker.save();
    
    res.status(200).json({ 
      message: "Availability updated", 
      worker 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};