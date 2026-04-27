const express = require("express");
const router = express.Router();
const { getWorkerTasks, completeTask, toggleAvailability, getWorkerMe, getAllWorkers, getWorkerStats } = require("../controllers/workerController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/me", protect, getWorkerMe);
router.get("/all", protect, getAllWorkers);
router.get("/tasks/:workerId", protect, getWorkerTasks);
router.put("/complete/:id", protect, completeTask);
router.patch("/availability/:workerId", protect, toggleAvailability);
router.get("/stats", protect, getWorkerStats);

module.exports = router;
