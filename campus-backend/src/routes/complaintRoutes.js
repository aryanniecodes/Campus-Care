const express = require("express");
const router = express.Router();
const { 
  createComplaint, 
  getAllComplaints, 
  getMyComplaints,
  getAssignedComplaints,
  deleteComplaint,
  giveFeedback,
  getComplaintsByStatus,
  getDashboardSummary,
  getAllFeedback,
  assignWorker,
  updateStatus,
  getAnalytics
} = require("../controllers/complaintController");
const upload = require("../middlewares/upload");
const { protect } = require("../middlewares/authMiddleware");

// POST /api/complaints
router.post("/", protect, upload.single("image"), createComplaint);

// GET /api/complaints/my (Student)
router.get("/my", protect, getMyComplaints);

// GET /api/complaints/all (Admin)
router.get("/all", protect, getAllComplaints);

// GET /api/complaints/assigned (Worker)
router.get("/assigned", protect, getAssignedComplaints);

// DELETE /api/complaints/:id (Admin)
router.delete("/:id", protect, deleteComplaint);

// GET /api/complaints/summary
router.get("/summary", getDashboardSummary);

// GET /api/complaints/status/:status
router.get("/status/:status", getComplaintsByStatus);

// PUT /api/complaints/feedback/:id
router.put("/feedback/:id", protect, giveFeedback);

// GET /api/complaints/feedback (Admin)
router.get("/feedback", protect, getAllFeedback);

// Admin Management
router.post("/assign", protect, assignWorker);
router.put("/status/:id", protect, updateStatus);
router.get("/analytics", protect, getAnalytics);

module.exports = router;
