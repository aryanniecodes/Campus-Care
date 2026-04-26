require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./src/config/db");
const Worker = require("./src/models/Worker");

const seedWorker = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Clear existing test worker to avoid duplicates
    const existing = await Worker.findOne({ workerId: "W101" });
    if (existing) {
      await Worker.deleteOne({ workerId: "W101" });
      console.log("Removed existing W101 worker.");
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash("123456", 10);

    // 4. Create new worker
    const testWorker = new Worker({
      workerId: "W101",
      name: "Test Worker",
      role: "electrician",
      password: hashedPassword,
      available: true,
      tasksAssigned: 0,
      email: "testworker101@example.com" // Added email as it might be required by schema
    });

    // 5. Save to DB
    await testWorker.save();
    console.log("✅ SUCCESS: Test Worker W101 seeded successfully!");

    // Exit gracefully
    process.exit(0);
  } catch (error) {
    console.error("❌ ERROR seeding worker:", error.message);
    process.exit(1);
  }
};

seedWorker();
