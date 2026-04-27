const express = require("express");
const router = express.Router();
const { getAllComplaints, getAllWorkers, getDashboardStats } = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/complaints", protect, getAllComplaints);
router.get("/workers", protect, getAllWorkers);
router.get("/stats", protect, getDashboardStats);

module.exports = router;
