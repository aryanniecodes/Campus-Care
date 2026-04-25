const express = require("express");
const router = express.Router();
const { registerStudent, registerWorker, login } = require("../controllers/authController");

// POST /api/auth/register-student
router.post("/register-student", registerStudent);

// POST /api/auth/register-worker
router.post("/register-worker", registerWorker);

// POST /api/auth/login
router.post("/login", login);

module.exports = router;
