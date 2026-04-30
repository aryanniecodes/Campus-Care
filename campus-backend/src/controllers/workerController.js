const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const Student = require("../models/Student");
const { sendEmail } = require("../services/emailService");
const Activity = require("../models/Activity");
const Notification = require("../models/notification.model.js");
const logger = require("../utils/logger");

// 1. Get Logged In Worker (Me)
exports.getWorkerMe = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id).select("-password");
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const completedTasks = await Complaint.countDocuments({
      assignedWorker: req.user.id,
      status: "completed"
    });

    const workerData = worker.toObject();
    workerData.available = workerData.tasksAssigned < 5;

    res.status(200).json({
      success: true,
      data: {
        ...workerData,
        completedTasks,
        assignedTasks: worker.tasksAssigned
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Assigned Tasks
exports.getWorkerTasks = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedWorker: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: { tasks: complaints } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Mark Task Complete
exports.completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { proofUrl } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    complaint.status = "completed";
    complaint.proofUrl = proofUrl;
    complaint.history.push({ status: "completed", timestamp: new Date() });
    await complaint.save();

    // ── Update Worker Assigned Count ──
    const worker = await Worker.findById(req.user.id);
    if (worker) {
      worker.tasksAssigned = Math.max(0, (worker.tasksAssigned || 0) - 1);

      // 🔄 QUEUE SYSTEM: Find pending complaint for this worker's role
      const roleToCategory = {
        electrician: "electricity",
        plumber: "plumbing",
        cleaner: "cleaning",
        mess: "mess"
      };

      const pendingComplaint = await Complaint.findOne({
        category: roleToCategory[worker.role],
        status: "pending"
      }).sort({ createdAt: 1 });

      if (pendingComplaint) {
        pendingComplaint.assignedWorker = worker._id;
        pendingComplaint.status = "in-progress";
        pendingComplaint.history.push({ status: "assigned", timestamp: new Date() });
        worker.tasksAssigned += 1;

        await pendingComplaint.save();

        // Notify Worker (the one who just completed a task and got a new one)
        await Notification.create({
          userId: worker._id,
          userType: "Worker",
          title: "New Task Auto-Assigned",
          message: `Task "${pendingComplaint.title}" has been assigned to you from the queue.`,
          type: "task_assigned"
        });

        if (worker.email) {
          const message = `Hello ${worker.name},\n\nYou have been automatically assigned a new task from the queue.\n\nTitle: ${pendingComplaint.title}\nCategory: ${pendingComplaint.category}\n\nPlease check your dashboard for details.\n\nBest regards,\nCampusCare Team`;
          await sendEmail(worker.email, "New Task Assigned - CampusCare", message);
        } else {
          logger.warn(`[EMAIL SKIP] No valid worker email found for worker ID: ${worker._id}`);
        }
      }

      await worker.save();
    }

    // Notify Student
    await Notification.create({
      userId: complaint.studentId,
      userType: "Student",
      title: "Complaint Resolved",
      message: `Your complaint "${complaint.title}" has been marked as completed.`,
      type: "status_update"
    });

    const student = await Student.findById(complaint.studentId);
    if (student && student.email) {
      const message = `Hello ${student.name},\n\nYour complaint "${complaint.title}" has been marked as completed.\n\nPlease check the app to provide feedback.\n\nBest regards,\nCampusCare Team`;

      await sendEmail(student.email, "Complaint Resolved - CampusCare", message);
    } else {
      logger.warn(`[EMAIL SKIP] No valid student email found for student ID: ${complaint.studentId}`);
    }

    res.json({ success: true, message: "Task marked as completed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Toggle Availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId).select("-password");

    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    worker.available = !worker.available;
    await worker.save();

    res.status(200).json({
      success: true,
      message: "Availability updated",
      data: { worker }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Get All Workers (Admin)
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().select("-password");
    const formattedWorkers = workers.map(w => {
      const obj = w.toObject();
      obj.available = obj.tasksAssigned < 5;
      return obj;
    });

    res.json({
      success: true,
      data: formattedWorkers
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📊 GET WORKER STATS (ADMIN)
exports.getWorkerStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const workers = await Worker.find();

    const data = await Promise.all(
      workers.map(async (w) => {
        const completed = await Complaint.countDocuments({
          assignedWorker: w._id,
          status: "completed"
        });

        return {
          id: w.workerId,
          name: w.name,
          tasksAssigned: w.tasksAssigned,
          completed,
          available: w.available
        };
      })
    );

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Error fetching worker stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};