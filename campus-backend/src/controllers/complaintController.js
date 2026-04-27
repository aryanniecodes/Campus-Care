const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const sendEmail = require("../utils/sendEmail");
const classifyComplaint = require("../ai/classifyComplaint");
const generateEmail = require("../ai/generateEmail");

// 🔥 CREATE COMPLAINT
exports.createComplaint = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    // AI Classification
    const category = await classifyComplaint(title, description);

    let imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = new Complaint({
      title,
      description,
      category,
      studentId: req.user.id,
      status: "pending",
      image: imagePath
    });

    await complaint.save();

    // Find ANY available worker
    const worker = await Worker.findOne({ available: true });

    console.log("FOUND WORKER:", worker);

    if (worker) {
      complaint.assignedTo = worker._id;
      complaint.status = "assigned";

      worker.tasksAssigned = (worker.tasksAssigned || 0) + 1;
      if (worker.tasksAssigned >= 5) worker.available = false;

      await worker.save();
      await complaint.save();

      console.log("ASSIGNING WORKER:", worker._id);

      // Static Fallback Email
      try {
        const emailText = `
New Complaint Assigned

Title: ${complaint.title}
Description: ${complaint.description}
Priority: ${complaint.priority}

Please check your dashboard.
        `.trim();
        
        if (process.env.ENABLE_EMAIL === "true") {
          console.log("SENDING EMAIL TO:", worker.email);
          await sendEmail(worker.email, "New task assigned", emailText);
        } else {
          console.log("EMAIL DISABLED (DEV MODE)");
        }
      } catch (err) {
        console.log("Email error:", err.message);
      }
    } else {
      console.log("NO WORKER FOUND");
    }

    res.status(201).json({
      success: true,
      message: worker ? "Complaint created and assigned" : "Complaint created but no worker available",
      data: {
        complaint,
        worker: worker ? {
          name: worker.name,
          role: worker.role,
          tasks: worker.tasksAssigned
        } : null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🔍 GET ALL COMPLAINTS (ADMIN)
exports.getAllComplaints = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 👨‍🎓 GET MY COMPLAINTS (STUDENT)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 👷 GET ASSIGNED COMPLAINTS (WORKER)
exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      assignedTo: req.user.id.toString()
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🗑️ DELETE COMPLAINT (ADMIN)
exports.deleteComplaint = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // If assigned to a worker, decrease their task count
    if (complaint.assignedTo) {
      const worker = await Worker.findById(complaint.assignedTo);
      if (worker) {
        worker.tasksAssigned = Math.max(0, (worker.tasksAssigned || 0) - 1);
        if (worker.tasksAssigned < 5) worker.available = true;
        await worker.save();
        console.log("Reduced tasks for worker on deletion:", worker._id);
      }
    }

    await complaint.deleteOne();

    res.json({ success: true, message: "Complaint deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 📝 GIVE FEEDBACK
exports.giveFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status !== "completed") {
      return res.status(400).json({
        message: "Cannot give feedback before completion"
      });
    }

    complaint.rating = rating;
    complaint.feedback = feedback;

    await complaint.save();

    res.json({
      success: true,
      message: "Feedback submitted successfully"
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// 📊 GET BY STATUS
exports.getComplaintsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const complaints = await Complaint.find({ status }).sort({ createdAt: -1 });
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

// 📊 DASHBOARD SUMMARY
exports.getDashboardSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const completed = await Complaint.countDocuments({ status: "completed" });
    const pending = await Complaint.countDocuments({ status: "pending" });

    res.status(200).json({
      success: true,
      data: { total, completed, pending }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ⭐ GET ALL FEEDBACK (ADMIN)
exports.getAllFeedback = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      rating: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: complaints
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🏗️ ASSIGN WORKER (ADMIN)
exports.assignWorker = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { complaintId, workerId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    // 1. If already has a worker, decrease their count
    if (complaint.assignedTo) {
      const oldWorker = await Worker.findById(complaint.assignedTo);
      if (oldWorker) {
        oldWorker.tasksAssigned = Math.max(0, (oldWorker.tasksAssigned || 0) - 1);
        if (oldWorker.tasksAssigned < 5) oldWorker.available = true;
        await oldWorker.save();
      }
    }

    // 2. Assign to new worker
    const newWorker = await Worker.findById(workerId);
    if (!newWorker) return res.status(404).json({ success: false, message: "Worker not found" });

    console.log("Assigning worker:", newWorker._id);

    complaint.assignedTo = workerId;
    complaint.status = "assigned";
    await complaint.save();

    newWorker.tasksAssigned = (newWorker.tasksAssigned || 0) + 1;
    if (newWorker.tasksAssigned >= 5) newWorker.available = false;
    await newWorker.save();

    res.json({ success: true, message: "Worker assigned successfully", data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🏗️ UPDATE STATUS (ADMIN)
exports.updateStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });

    // If marking as completed, handle worker tasks
    if (status === "completed" && complaint.status !== "completed") {
      if (complaint.assignedTo) {
        const worker = await Worker.findById(complaint.assignedTo);
        if (worker) {
          worker.tasksAssigned = Math.max(0, (worker.tasksAssigned || 0) - 1);
          if (worker.tasksAssigned < 5) worker.available = true;
          await worker.save();
        }
      }
    }

    complaint.status = status;
    await complaint.save();

    res.json({ success: true, message: "Status updated successfully", data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};