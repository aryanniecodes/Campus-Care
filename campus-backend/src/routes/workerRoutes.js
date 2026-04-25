const express = require("express");
const router = express.Router();
const { getWorkerTasks, completeTask, toggleAvailability } = require("../controllers/workerController");

router.get("/tasks/:workerId", getWorkerTasks);
router.put("/complete/:complaintId", completeTask);
router.patch("/availability/:workerId", toggleAvailability);

module.exports = router;
