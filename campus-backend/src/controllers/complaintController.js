const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const sendEmail = require("../utils/sendEmail");

// 🔥 CREATE COMPLAINT + AI + ASSIGNMENT
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, studentId } = req.body;

    if (!title || !description || !studentId) {
      return res.status(400).json({ message: "Title, description, and studentId are required" });
    }

    // 1. Keyword-based category detection
    const text = (title + " " + description).toLowerCase();
    let category = "other";

    if (text.includes("fan") || text.includes("light")) category = "electrician";
    else if (text.includes("water") || text.includes("leakage")) category = "plumber";
    else if (text.includes("cleaning")) category = "cleaner";
    else if (text.includes("food") || text.includes("mess")) category = "mess";

    // 2. Strict worker assignment (role = category, available = true, tasksAssigned < 5)
    const worker = await Worker.findOne({
      role: category,
      available: true,
      tasksAssigned: { $lt: 5 }
    });

    let assignedWorker = null;
    let status = "pending";

    // 3. Assignment Behavior
    if (worker) {
      assignedWorker = worker._id;
      status = "assigned";

      worker.tasksAssigned += 1;
      if (worker.tasksAssigned === 5) {
        worker.available = false;
      }
      await worker.save();

      // Send email notification to worker
      sendEmail(
        worker.email,
        "New task assigned",
        `New task assigned: ${title}`
      );
    }

    // 4. Image handling (optional multer)
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // 5. Save Complaint
    const newComplaint = new Complaint({
      title,
      description,
      category,
      studentId,
      assignedWorker,
      status,
      image: imagePath
    });

    await newComplaint.save();

    // 6. Response
    if (!worker) {
      return res.status(201).json({
        message: "No worker available",
        complaint: newComplaint
      });
    }

    res.status(201).json({
      message: "Complaint created and assigned",
      complaint: newComplaint,
      worker: {
        name: worker.name,
        role: worker.role,
        tasks: worker.tasksAssigned
      }
    });

  } catch (error) {
    console.error("Error in createComplaint:", error);
    res.status(500).json({ message: error.message });
  }
};


// 🔍 GET ALL COMPLAINTS (ADMIN)
exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json({ complaints });
  } catch (error) {
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
    res.status(500).json({ message: error.message });
  }
};