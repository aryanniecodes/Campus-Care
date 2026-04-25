const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  rollNo: String,
  name: String,
  email: String,
  password: String,
  hostel: String
});

module.exports = mongoose.model("Student", studentSchema);