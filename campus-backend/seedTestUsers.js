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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 1. Student Check
    const studentExists = await Student.findOne({ rollNo: "test123" });
    if (!studentExists) {
      await new Student({
        rollNo: "test123",
        name: "Test Student",
        email: "student@test.com",
        password: hashedPassword,
        hostel: "A1"
      }).save();
      console.log("Student test123 created.");
    }

    // 2. Workers List
    const workers = [
      {
        workerId: "W101",
        name: "Test Worker",
        email: "aryaniecodes@gmail.com",
        role: "electrician",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      },
      {
        workerId: "W102",
        name: "Ravi Kumar",
        email: "ravi@test.com",
        role: "plumber",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      },
      {
        workerId: "W103",
        name: "Amit Singh",
        email: "amit@test.com",
        role: "cleaner",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      }
    ];

    for (const w of workers) {
      const exists = await Worker.findOne({ workerId: w.workerId });
      if (!exists) {
        await new Worker(w).save();
        console.log(`Worker ${w.workerId} (${w.name}) created.`);
      } else {
        console.log(`Worker ${w.workerId} already exists, skipping.`);
      }
    }

    // 3. Admin Check
    const adminExists = await Admin.findOne({ email: "admin@test.com" });
    if (!adminExists) {
      await new Admin({
        name: "Admin User",
        email: "admin@test.com",
        password: hashedPassword
      }).save();
      console.log("Admin created.");
    }

    console.log("Test users seeding process completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding users:", error);
    process.exit(1);
  }
};

seedTestUsers();
