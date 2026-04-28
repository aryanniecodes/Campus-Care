const Activity = require("../models/Activity");

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(20);
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
