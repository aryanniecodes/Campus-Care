require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const Worker = require("./src/models/Worker");

const updateWorkerEmail = async () => {
  try {
    await connectDB();
    await Worker.updateOne(
      { workerId: "W101" },
      { $set: { email: "aryaniecodes@gmail.com" } }
    );
    console.log("Worker email updated successfully");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateWorkerEmail();
