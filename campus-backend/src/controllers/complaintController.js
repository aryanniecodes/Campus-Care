const axios = require("axios");
const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const sendEmail = require("../utils/sendEmail");

// 🔥 CREATE COMPLAINT + AI + ASSIGNMENT
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, studentId } = req.body;

    let category = "other";

    // 🤖 AI CALL
    try {
      const aiRes = await axios.post("http://localhost:8000/classify", {
        text: title + " " + description
      });

      category = aiRes.data.category;
    } catch (err) {
      console.log("AI failed, using fallback category");
    }

    // 🔧 CATEGORY → ROLE MAPPING
    let roleMap = {
      electricity: "electrician",
      plumbing: "plumber",
      cleaning: "cleaner",
      other: "cleaner"
    };

    // 👷 WORKER ASSIGNMENT
    let worker = await Worker.findOne({
      role: roleMap[category],
      available: true,
      tasksAssigned: { $lt: 5 }
    });

    console.log("Category:", category);
    console.log("Mapped role:", roleMap[category]);
    console.log("Worker found:", worker);

    if (!worker) {
      worker = await Worker.findOne();
    }

    let assignedWorker = null;

    if (worker) {
      assignedWorker = worker._id;

      worker.tasksAssigned += 1;
      await worker.save();

      sendEmail(
        worker.email || worker.workerId,
        "New Task Assigned",
        `You have been assigned a new complaint: ${title}`
      );
    }

    // 📸 IMAGE HANDLING
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // ⭐ PRIORITY DETECTION
    const count = await Complaint.countDocuments({ title });
    const priority = count >= 2 ? "high" : "low";

    // 💾 SAVE COMPLAINT
    const newComplaint = new Complaint({
      title,
      description,
      category,
      studentId,
      assignedWorker,
      image: imagePath,
      priority
    });

    await newComplaint.save();

    res.status(201).json({
      message: "Complaint created + assigned",
      complaint: newComplaint
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// 🔍 GET ALL COMPLAINTS (ADMIN)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });

    res.status(200).json({ complaints });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📝 GIVE FEEDBACK
exports.giveFeedback = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { rating, feedback, isApproved } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (rating !== undefined) complaint.rating = rating;
    if (feedback !== undefined) complaint.feedback = feedback;
    if (isApproved !== undefined) complaint.isApproved = isApproved;

    await complaint.save();

    res.status(200).json({
      message: "Feedback submitted",
      complaint
    });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📊 GET COMPLAINTS BY STATUS
exports.getComplaintsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const complaints = await Complaint.find({ status }).sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 📈 GET DASHBOARD SUMMARY
exports.getDashboardSummary = async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const completed = await Complaint.countDocuments({ status: "completed" });
    const pending = await Complaint.countDocuments({ status: "pending" });

    res.status(200).json({ total, completed, pending });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// 👨‍🎓 GET MY COMPLAINTS
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
      assignedWorker: req.user.id
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    const { complaintId, workerId } = req.body;
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found" });
    complaint.assignedWorker = workerId;
    complaint.status = "pending";
    await complaint.save();
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
    await complaint.save();
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
    const pending = await Complaint.countDocuments({ status: "pending" });
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