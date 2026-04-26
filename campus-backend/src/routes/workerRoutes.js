const express = require("express");
const router = express.Router();
const { getWorkerTasks, completeTask, toggleAvailability, getWorkerMe } = require("../controllers/workerController");
const { protect } = require("../middlewares/authMiddleware");

router.get("/me", protect, getWorkerMe);
router.get("/tasks/:workerId", getWorkerTasks);
router.put("/complete/:id", protect, completeTask);
router.patch("/availability/:workerId", toggleAvailability);

module.exports = router;
