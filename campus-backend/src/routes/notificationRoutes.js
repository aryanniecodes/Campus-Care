const express = require("express");
const Notification = require("../models/notification.model.js");

const router = express.Router();

// GET notifications
router.get("/", async (req, res) => {
  try {
    const { userId, role } = req.query;

    const notifications = await Notification.find({ userId, role })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// MARK AS READ
router.put("/read", async (req, res) => {
  try {
    const { userId, role } = req.body;

    await Notification.updateMany(
      { userId, role, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
