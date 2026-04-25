const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    workerId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      enum: ["electrician", "plumber", "cleaner", "mess"]
    },

    password: {
      type: String,
      required: true
    },

    available: {
      type: Boolean,
      default: true
    },

    tasksAssigned: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Worker", workerSchema);