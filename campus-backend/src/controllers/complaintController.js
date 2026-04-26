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

    // Worker assignment
    const worker = await Worker.findOne({
      role: category,
      available: true,
      tasksAssigned: { $lt: 5 }
    });

    let assignedTo = null;
    let status = "pending";

    if (worker) {
      assignedTo = worker._id;
      status = "assigned";
      worker.tasksAssigned += 1;
      if (worker.tasksAssigned >= 5) worker.available = false;
      await worker.save();

      // AI Email content
      const emailText = await generateEmail(title, category);
      sendEmail(worker.email, "New task assigned", emailText);
    }

    let imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newComplaint = new Complaint({
      title,
      description,
      category,
      studentId: req.user.id,
      assignedTo,
      status,
      image: imagePath
    });

    await newComplaint.save();

    res.status(201).json({
      success: true,
      message: worker ? "Complaint created and assigned" : "No worker available",
      data: {
        complaint: newComplaint,
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
    const complaints = await Complaint.find({ assignedTo: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🗑️ DELETE COMPLAINT (ADMIN)
exports.deleteComplaint = async (req, res) => {
  try {
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

// 📝 GIVE FEEDBACK
exports.giveFeedback = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { rating, feedback, isApproved } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    if (rating !== undefined) complaint.rating = rating;
    if (feedback !== undefined) complaint.feedback = feedback;
    if (isApproved !== undefined) complaint.isApproved = isApproved;

    await complaint.save();

    res.status(200).json({
      success: true,
      message: "Feedback submitted",
      data: { complaint }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
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

// 📈 DASHBOARD SUMMARY
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