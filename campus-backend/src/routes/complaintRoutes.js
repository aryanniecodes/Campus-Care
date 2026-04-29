const express = require("express");
const router = express.Router();
const { 
  createComplaint, 
  getAllComplaints, 
  getMyComplaints,
  getAssignedComplaints,
  getWorkerComplaints,
  deleteComplaint,
  giveFeedback,
  getComplaintsByStatus,
  getDashboardSummary,
  getAllFeedback,
  assignWorker,
  updateStatus,
  getAnalytics,
  getHighPriorityComplaints,
  getEscalatedComplaints
} = require("../controllers/complaintController");
const { getSimilarComplaints } = require("../controllers/aiController");
const upload = require("../middlewares/upload");
const { protect } = require("../middlewares/authMiddleware");


// GET /api/complaints/high-priority (Admin - Public for Demo)
router.get("/high-priority", getHighPriorityComplaints);

// GET /api/complaints/escalated (Admin - Public for Demo)
router.get("/escalated", getEscalatedComplaints);

// POST /api/complaints
router.post("/", protect, upload.single("image"), createComplaint);

// GET /api/complaints/my (Student)
router.get("/my", protect, getMyComplaints);

// GET /api/complaints/all (Admin)
router.get("/all", protect, getAllComplaints);

// GET /api/complaints/assigned (Worker)
router.get("/assigned", protect, getAssignedComplaints);
router.get("/worker", protect, getWorkerComplaints);

// GET similar complaints
router.get("/:id/similar", protect, getSimilarComplaints);

// DELETE /api/complaints/:id (Admin)
router.delete("/:id", protect, deleteComplaint);

// GET /api/complaints/summary
router.get("/summary", getDashboardSummary);

// GET /api/complaints/status/:status
router.get("/status/:status", getComplaintsByStatus);

// PUT /api/complaints/:id/feedback
router.put("/:id/feedback", protect, giveFeedback);

// GET /api/complaints/feedback (Admin)
router.get("/feedback", protect, getAllFeedback);

// Admin Management
router.put("/assign/:id", protect, assignWorker);
router.put("/status/:id", protect, updateStatus);
router.get("/analytics", protect, getAnalytics);

module.exports = router;
