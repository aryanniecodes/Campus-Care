const express = require("express");
const router = express.Router();
const { getAllComplaints, getAllWorkers } = require("../controllers/adminController");

router.get("/complaints", getAllComplaints);
router.get("/workers", getAllWorkers);

module.exports = router;
