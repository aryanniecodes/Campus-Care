const Feedback = require("../models/Feedback");
const Complaint = require("../models/Complaint");

exports.submitFeedback = async (req, res) => {
  try {
    console.log("Incoming Body:", req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "No data received or empty body" });
    }

    const { complaintId, studentId, rating, feedback } = req.body;

    // 1. Create and save the new feedback
    const newFeedback = new Feedback({
      complaintId,
      studentId,
      rating,
      feedback
    });
    
    await newFeedback.save();

    // 2. Find associated complaint and close it
    const complaint = await Complaint.findById(complaintId);
    if (complaint) {
      complaint.status = "closed";
      await complaint.save();
    }

    // 3. Return success response
    res.status(201).json({
      message: "Feedback submitted successfully and complaint closed",
      feedback: newFeedback
    });

  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ message: error.message });
  }
};
