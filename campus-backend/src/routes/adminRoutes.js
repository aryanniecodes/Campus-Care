const express = require("express");
const router = express.Router();
const { getAllComplaints, getAllWorkers, getDashboardSummary } = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/complaints", protect, getAllComplaints);
router.get("/workers", protect, getAllWorkers);
router.get("/dashboard", getDashboardSummary);

module.exports = router;
