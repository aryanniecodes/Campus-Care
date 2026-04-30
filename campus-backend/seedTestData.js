require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Student = require("./src/models/Student");
const Worker = require("./src/models/Worker");

async function seedData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Task 1: Update Existing Student Email
    console.log("\n--- TASK 1: UPDATE EXISTING STUDENT ---");
    const existingStudent = await Student.findOne({ name: "Test Student" });
    if (existingStudent) {
      existingStudent.email = "2k25cse2511053@gmail.com";
      await existingStudent.save();
      console.log(`Updated email for ${existingStudent.name} to 2k25cse2511053@gmail.com`);
    } else {
      console.log("Existing student 'Test Student' not found. Skipping update.");
    }

    // Hash password for new records
    console.log("\nGenerating hashed password for new users...");
    const hashedPassword = await bcrypt.hash("123456", 10);

    // Task 2: Add More Students
    console.log("\n--- TASK 2: ADD MORE STUDENTS ---");
    const students = [
      {
        rollNo: "test124",
        name: "Test Student 2",
        email: "2k25cse2511053@gmail.com",
        password: hashedPassword,
        hostel: "A1"
      },
      {
        rollNo: "test125",
        name: "Test Student 3",
        email: "2k25cse2511053@gmail.com",
        password: hashedPassword,
        hostel: "A2"
      }
    ];

    for (const s of students) {
      const exists = await Student.findOne({ rollNo: s.rollNo });
      if (exists) {
        console.log(`Student ${s.rollNo} already exists.`);
      } else {
        await Student.create(s);
        console.log(`Created student: ${s.name} (${s.rollNo})`);
      }
    }

    // Task 3: Add Workers
    console.log("\n--- TASK 3: ADD WORKERS ---");
    const workers = [
      {
        workerId: "W201",
        name: "Cleaner Worker",
        email: "aryaniecodes+cleaner@gmail.com",
        role: "cleaner",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      },
      {
        workerId: "W202",
        name: "Plumber Worker",
        email: "aryaniecodes+plumber@gmail.com",
        role: "plumber",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      },
      {
        workerId: "W203",
        name: "Electrician Worker",
        email: "aryaniecodes+electrician@gmail.com",
        role: "electrician",
        password: hashedPassword,
        available: true,
        tasksAssigned: 0
      }
    ];

    for (const w of workers) {
      const exists = await Worker.findOne({ workerId: w.workerId });
      if (exists) {
        console.log(`Worker ${w.workerId} already exists.`);
      } else {
        await Worker.create(w);
        console.log(`Created worker: ${w.name} (${w.workerId})`);
      }
    }

    console.log("\n✅ All seed tasks completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seedData();
