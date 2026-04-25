const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Worker = require("../models/Worker");

const JWT_SECRET = process.env.JWT_SECRET || "mysecret123";

// ─── Register Student ──────────────────────────────────────────────────────────
exports.registerStudent = async (req, res) => {
  try {
    const { rollNo, name, email, password, hostel } = req.body;

    if (!rollNo || !name || !email || !password) {
      return res.status(400).json({ message: "rollNo, name, email and password are required" });
    }

    const existing = await Student.findOne({ rollNo });
    if (existing) {
      return res.status(409).json({ message: "Student with this rollNo already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = new Student({ rollNo, name, email, password: hashedPassword, hostel });
    await student.save();

    res.status(201).json({ message: "Student registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Register Worker ───────────────────────────────────────────────────────────
exports.registerWorker = async (req, res) => {
  try {
    const { workerId, name, email, role, password } = req.body;

    if (!workerId || !name || !role || !password) {
      return res.status(400).json({ message: "workerId, name, role and password are required" });
    }

    const existing = await Worker.findOne({ workerId });
    if (existing) {
      return res.status(409).json({ message: "Worker with this workerId already exists" });
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

    res.status(201).json({ message: "Worker registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Login (Student + Worker + Admin) ─────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { role, id, password } = req.body;

    if (!role || !id || !password) {
      return res.status(400).json({ message: "role, id and password are required" });
    }

    // Admin hardcoded check
    if (role === "admin") {
      if (id === "admin@gmail.com" && password === "admin123") {
        const token = jwt.sign({ id: "admin", role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
        return res.json({ message: "Login successful", role: "admin", token });
      }
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    // Student / Worker lookup
    let user;
    if (role === "student") {
      user = await Student.findOne({ rollNo: id });
    } else if (role === "worker") {
      user = await Worker.findOne({ workerId: id }).select("-password");
      // Need password for comparison — re-fetch with password
      user = await Worker.findOne({ workerId: id });
    } else {
      return res.status(400).json({ message: "Invalid role. Use: student | worker | admin" });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      role,
      user: {
        id: user._id,
        name: user.name,
        role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
