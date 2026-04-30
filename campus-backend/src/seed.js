const mongoose = require("mongoose");
require("dotenv").config();
const logger = require("./utils/logger");

const Worker = require("./models/Worker");

async function seedWorkers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB Connected for seeding");

    await Worker.deleteMany();

    await Worker.insertMany([
      {
        workerId: "W101",
        name: "Rahul Electrician",
        email: "aryaniecodes@gmail.com",
        role: "electrician",
        available: true,
        tasksAssigned: 0,
        password: "password123" // Adding placeholder as password is required
      },
      {
        workerId: "W102",
        name: "Amit Plumber",
        email: "aryaniecodes@gmail.com",
        role: "plumber",
        available: true,
        tasksAssigned: 0,
        password: "password123"
      },
      {
        workerId: "W103",
        name: "Ramesh Cleaner",
        email: "aryaniecodes@gmail.com",
        role: "cleaner",
        available: true,
        tasksAssigned: 0,
        password: "password123"
      }
    ]);

    logger.info("Workers seeded successfully");
    process.exit();

  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

seedWorkers();