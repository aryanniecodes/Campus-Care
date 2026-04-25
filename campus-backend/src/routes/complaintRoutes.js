const express = require("express");
const router = express.Router();
const { 
  createComplaint, 
  getAllComplaints, 
  giveFeedback,
  getComplaintsByStatus,
  getDashboardSummary
} = require("../controllers/complaintController");
const upload = require("../middlewares/upload");

// POST /api/complaints
router.post("/", upload.single("image"), createComplaint);

// GET /api/complaints
router.get("/", getAllComplaints);

// GET /api/complaints/summary
router.get("/summary", getDashboardSummary);

// GET /api/complaints/status/:status
router.get("/status/:status", getComplaintsByStatus);

// PUT /api/complaints/feedback/:complaintId
router.put("/feedback/:complaintId", giveFeedback);

module.exports = router;
