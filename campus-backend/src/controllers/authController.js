const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Worker = require("../models/Worker");
const Admin = require("../models/Admin");

const JWT_SECRET = process.env.JWT_SECRET || "mysecret123";

// ─── Register Student ──────────────────────────────────────────────────────────
exports.registerStudent = async (req, res) => {
  try {
    const { rollNo, name, email, password, hostel } = req.body;

    if (!rollNo || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "rollNo, name, email and password are required"
      });
    }

    const existing = await Student.findOne({ rollNo });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Student with this rollNo already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ rollNo, name, email, password: hashedPassword, hostel });
    await student.save();

    res.status(201).json({
      success: true,
      message: "Student registered successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── Register Worker ───────────────────────────────────────────────────────────
exports.registerWorker = async (req, res) => {
  try {
    const { workerId, name, email, role, password } = req.body;

    if (!workerId || !name || !role || !password) {
      return res.status(400).json({
        success: false,
        message: "workerId, name, role and password are required"
      });
    }

    const existing = await Worker.findOne({ workerId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Worker with this workerId already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const worker = new Worker({
      workerId,
      name,
      email,
      role,
      password: hashedPassword,
      available: true,
      tasksAssigned: 0
    });
    await worker.save();

    res.status(201).json({
      success: true,
      message: "Worker registered successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { role, id, password } = req.body || {};

    if (!role || !id || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body for login. Required: role, id, password"
      });
    }

    // Admin check
    if (role === "admin") {
      const admin = await Admin.findOne({ email: id });

      if (!admin) {
        return res.status(401).json({ success: false, message: "Invalid admin credentials" });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid admin credentials" });
      }

      const token = jwt.sign({ id: admin._id, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
      return res.json({
        success: true,
        message: "Login successful",
        data: { role: "admin", name: admin.name || "Administrator", token }
      });
    }

    let user;
    if (role === "student") {
      user = await Student.findOne({ rollNo: id });
    } else if (role === "worker") {
      user = await Worker.findOne({ workerId: id });
    } else {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        role,
        user: {
          id: user._id,
          name: user.name,
          role
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
