const mongoose = require("mongoose");
require("dotenv").config();

const Complaint = require("./src/models/Complaint");
const Worker = require("./src/models/Worker");
const Feedback = require("./src/models/Feedback");

async function resetDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    // Delete all complaints
    await Complaint.deleteMany({});

    // Delete feedback
    await Feedback.deleteMany({});

    // Reset ALL workers properly
    const workers = await Worker.find();

    for (let worker of workers) {
      worker.tasksAssigned = 0;
      worker.available = true;
      await worker.save();
    }

    console.log("FULL RESET COMPLETE");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetDB();
