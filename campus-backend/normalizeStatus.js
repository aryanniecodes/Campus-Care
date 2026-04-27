require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");
const Complaint = require("./src/models/Complaint");

const normalizeStatus = async () => {
  try {
    await connectDB();

    console.log("Normalizing statuses...");

    // 1. Convert all non-completed to pending
    const res = await Complaint.updateMany(
      { status: { $ne: "completed" } },
      { $set: { status: "pending" } }
    );

    console.log(`Updated ${res.modifiedCount} complaints to 'pending'.`);

    // 2. Ensure all 'completed' are lowercase (if any were 'Completed' etc.)
    const res2 = await Complaint.updateMany(
      { status: { $regex: /^completed$/i } },
      { $set: { status: "completed" } }
    );

    console.log(`Normalized ${res2.modifiedCount} 'completed' statuses.`);

    console.log("Status normalization completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error normalizing status:", error);
    process.exit(1);
  }
};

normalizeStatus();
