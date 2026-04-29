const axios = require("axios");
const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const sendEmail = require("../utils/sendEmail");
const Activity = require("../models/Activity");
const Notification = require("../models/notification.model.js");

// 🔥 CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    const roleMap = {
      plumbing: "plumber",
      electric: "electrician",
      electrical: "electrician",
      cleaning: "cleaner",
      other: "cleaner"
    };

    const workerRole = roleMap[category] || "cleaner";

    const worker = await Worker.findOne({
      role: workerRole,
      tasksAssigned: { $lt: 5 }
    });

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      studentId: req.user.id,
      assignedWorker: worker ? worker._id : null,
      image: imagePath,
      status: worker ? "in-progress" : "pending",
      history: [{ status: "created", timestamp: new Date() }]
    });

    if (worker) {
      worker.tasksAssigned += 1;
      if (worker.tasksAssigned >= 5) {
        worker.available = false;
      }
      await worker.save();
    }

    await Activity.create({
      message: "New complaint submitted",
      type: "complaint"
    });

    // Notify Admin
    await Notification.create({
      userId: "admin",
      role: "admin",
      message: "New complaint submitted"
    });

    // Notify Worker if assigned
    if (worker) {
      await Notification.create({
        userId: worker.workerId,
        role: "worker",
        message: "New task assigned to you"
      });
    }

    res.json({ success: true, data: complaint });

  } catch (error) {
    console.error("CREATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// 🔍 GET ALL COMPLAINTS (ADMIN)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("assignedWorker", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: complaints });
  } catch (error) {
    console.error(error);
    res.json({ success: true, data: [] });
  }
};

// 📝 GIVE FEEDBACK
exports.giveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(200).json({
        success: false,
        message: "Complaint not found"
      });
    }

    complaint.feedback = feedback;
    complaint.rating = rating;
    complaint.isApproved = true; // Mark as approved once feedback is given
    complaint.history.push({ status: "feedback", timestamp: new Date() });

    await complaint.save();

    await Activity.create({
      message: "Feedback submitted",
      type: "feedback"
    });

    return res.json({
      success: true,
      message: "Feedback submitted"
    });

  } catch (error) {
    console.error("FEEDBACK ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📊 GET COMPLAINTS BY STATUS
exports.getComplaintsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const complaints = await Complaint.find({ status }).populate("assignedWorker", "name email").sort({ createdAt: -1 });
    
    const formatted = complaints.map(c => ({
      ...c.toObject(),
      assignedTo: c.assignedWorker
    }));
    
    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📈 GET DASHBOARD SUMMARY
exports.getDashboardSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();

    const completed = await Complaint.countDocuments({
      status: "completed"
    });

    const pending = await Complaint.countDocuments({
      status: { $ne: "completed" }
    });

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending
      }
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 👨‍🎓 GET MY COMPLAINTS
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      studentId: req.user.id
    }).populate("assignedWorker", "name email");

    res.json({ success: true, data: complaints });
  } catch (error) {
    console.error(error);
    res.json({ success: true, data: [] });
  }
};

// 👷 GET ASSIGNED COMPLAINTS (WORKER)
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedWorker: req.user.id
    }).sort({ createdAt: -1 });

    const formatted = complaints.map(c => ({
      ...c.toObject(),
      assignedTo: c.assignedWorker
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getWorkerComplaints = async (req, res) => {
  try {
    const workerId = req.user.id;

    const complaints = await Complaint.find({
      assignedWorker: workerId
    }).sort({ createdAt: -1 });

    const formatted = complaints.map(c => ({
      ...c.toObject(),
      assignedTo: c.assignedWorker
    }));

    res.json({
      success: true,
      data: formatted
    });

  } catch (error) {
    console.error("WORKER FETCH ERROR:", error);
    res.json({ success: true, data: [] });
  }
};

// 🗑️ DELETE COMPLAINT
exports.deleteComplaint = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }
    await complaint.deleteOne();
    res.json({ success: true, message: "Complaint deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ⭐ GET ALL FEEDBACK
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Complaint.find({
      rating: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🏗️ ASSIGN WORKER
exports.assignWorker = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const { workerId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    complaint.assignedWorker = workerId;
    complaint.status = "pending";
    complaint.history.push({ status: "assigned", timestamp: new Date() });
    await complaint.save();

    const worker = await Worker.findById(workerId);
    if (worker) {
      worker.tasksAssigned = (worker.tasksAssigned || 0) + 1;
      if (worker.tasksAssigned >= 5) {
        worker.available = false;
      }
      await worker.save();
    }

    await Activity.create({
      message: "Worker assigned to complaint",
      type: "assignment"
    });

    // Notify Worker
    await Notification.create({
      userId: worker.workerId,
      role: "worker",
      message: "New task assigned to you"
    });

    res.json({ success: true, message: "Worker assigned successfully", data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🏗️ UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    complaint.status = status;
    complaint.history.push({ status, timestamp: new Date() });
    await complaint.save();

    // Notify Student if completed
    if (status === "completed") {
      await Notification.create({
        userId: complaint.studentId,
        role: "student",
        message: "Your complaint has been resolved"
      });
    }

    res.json({ success: true, message: "Status updated successfully", data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📊 GET ANALYTICS
exports.getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const total = await Complaint.countDocuments();
    const completed = await Complaint.countDocuments({ status: "completed" });
    const pending = await Complaint.countDocuments({ status: { $ne: "completed" } });
    
    const ratings = await Complaint.find({ rating: { $exists: true, $ne: null } });
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, c) => sum + c.rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      data: {
        total,
        completed,
        pending,
        avgRating: Number(avgRating.toFixed(1))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};