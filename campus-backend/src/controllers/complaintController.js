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
        
        console.log("SENDING EMAIL TO:", worker.email);
        sendEmail(worker.email, "New task assigned", emailText);
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
    console.log("REQ.USER.ID:", req.user.id);

    const allComplaints = await Complaint.find();
    console.log("ALL COMPLAINTS:", allComplaints);

    const complaints = await Complaint.find({
      assignedTo: req.user.id.toString()
    }).sort({ createdAt: -1 });

    console.log("FILTERED COMPLAINTS:", complaints);

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