require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const connectDB = require("./src/config/db");
const Worker = require("./src/models/Worker");

const seedWorkers = async () => {
  try {
    // 1. Connect to DB
    await connectDB();

    // 2. Delete existing workers
    await Worker.deleteMany({});
    console.log("Old workers deleted");

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 4. Define new workers data
    const workers = [
      {
        workerId: "W101",
        name: "Ramesh",
        email: "ramesh@test.com",
        role: "electrician",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      },
      {
        workerId: "W102",
        name: "Suresh",
        email: "suresh@test.com",
        role: "plumber",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      },
      {
        workerId: "W103",
        name: "Mahesh",
        email: "mahesh@test.com",
        role: "cleaner",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      }
    ];

    // 5. Insert new workers
    await Worker.insertMany(workers);
    console.log("New workers inserted");

    // 6. Exit process gracefully
    process.exit(0);
  } catch (error) {
    console.error("Error seeding workers:", error);
    process.exit(1);
  }
};

seedWorkers();
