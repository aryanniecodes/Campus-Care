require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./src/config/db");
const Student = require("./src/models/Student");
const Worker = require("./src/models/Worker");
const Admin = require("./src/models/Admin");

const seedTestUsers = async () => {
  try {
    await connectDB();

    // 1. CLEAR existing data completely to prevent duplicate key errors
    await Student.deleteMany({});
    await Worker.deleteMany({});
    await Admin.deleteMany({});

    // 2. Hash password safely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 3. Create Student
    const testStudent = new Student({
      rollNo: "test123",
      name: "Test Student",
      email: "student@test.com",
      password: hashedPassword,
      hostel: "A1"
    });
    await testStudent.save();

    // 4. Create Worker
    const testWorker = new Worker({
      workerId: "W101",
      name: "Test Worker",
      email: "worker@test.com",
      role: "electrician",
      password: hashedPassword,
      available: true,
      tasksAssigned: 0
    });
    await testWorker.save();

    // 5. Create Admin
    const testAdmin = new Admin({
      name: "Admin User",
      email: "admin@test.com",
      password: hashedPassword
    });
    await testAdmin.save();

    console.log("Test users recreated successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error creating users:", error);
    process.exit(1);
  }
};

seedTestUsers();
