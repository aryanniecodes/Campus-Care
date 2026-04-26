const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");

// 1. Post Feedback
exports.giveFeedback = async (req, res) => {
  try {
    const { complaintId, studentId, rating, feedback } = req.body;

    if (!complaintId || !studentId || !rating) {
      return res.status(400).json({
        success: false,
        message: "complaintId, studentId and rating are required"
      });
    }

    const newFeedback = new Feedback({
      complaintId,
      studentId,
      rating,
      feedback
    });

    await newFeedback.save();

    // Close complaint
    await Complaint.findByIdAndUpdate(complaintId, { status: "closed" });

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: { feedback: newFeedback }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
