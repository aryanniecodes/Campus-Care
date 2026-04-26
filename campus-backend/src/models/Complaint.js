const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  image: String,
  studentId: String,
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Worker"
  },
  proofImage: String,
  rating: Number,
  feedback: String,
  isApproved: Boolean,
  priority: { type: String, default: "low" },
  status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Complaint", complaintSchema);