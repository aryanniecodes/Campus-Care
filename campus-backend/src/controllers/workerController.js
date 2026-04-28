const Complaint = require("../models/Complaint");
const Worker = require("../models/Worker");
const Student = require("../models/Student");
const sendEmail = require("../utils/sendEmail");
const Activity = require("../models/Activity");

// 1. Get Logged In Worker (Me)
exports.getWorkerMe = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user.id).select("-password");
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }

    const completedTasks = await Complaint.countDocuments({ 
      assignedTo: req.user.id, 
      status: "completed" 
    });

    const workerData = worker.toObject();
    workerData.available = workerData.tasksAssigned < 5;

    res.status(200).json({ 
      success: true, 
      data: { 
        ...workerData, 
        completedTasks,
        assignedTasks: worker.tasksAssigned 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Assigned Tasks
exports.getWorkerTasks = async (req, res) => {
  try {
    const { workerId } = req.params;

    const tasks = await Complaint.find({ assignedWorker: workerId })
      .select("title description status category image createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tasks }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Mark Task Complete
exports.completeTask = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    if (complaint.status === "completed") {
      return res.status(400).json({
        message: "Task already completed"
      });
    }

    // Update complaint
    complaint.status = "completed";
    complaint.history.push({ status: "completed", timestamp: new Date() });
    await complaint.save();

    await Activity.create({
      message: "Complaint marked as completed",
      type: "completion"
    });

    // Update worker
    const worker = await Worker.findById(req.user.id);
    if (worker) {
      worker.tasksAssigned = Math.max(0, (worker.tasksAssigned || 0) - 1);
      
      // 🔄 QUEUE SYSTEM: Find pending complaint for this worker's role
      const roleToCategory = {
        electrician: "electricity",
        plumber: "plumbing",
        cleaner: "cleaning"
      };

      const pendingComplaint = await Complaint.findOne({
        category: roleToCategory[worker.role] || "cleaning",
        status: "pending"
      });

      if (pendingComplaint) {
        pendingComplaint.assignedWorker = worker._id;
        pendingComplaint.status = "in-progress";
        pendingComplaint.history.push({ status: "assigned", timestamp: new Date() });
        worker.tasksAssigned += 1;
        
        await pendingComplaint.save();
        console.log("AUTO ASSIGNED FROM QUEUE:", pendingComplaint._id);
      }

      if (worker.tasksAssigned < 5) {
        worker.available = true;
      }
      await worker.save();
    }

    // Send email to student
    const student = await Student.findById(complaint.studentId);

    if (student) {
      const message = `
Your complaint has been completed

Title: ${complaint.title}
Status: Completed

Thank you for your patience.
      `;

      const testEmail = "aryanicodes@gmail.com";
      if (process.env.ENABLE_EMAIL === "true") {
        console.log("SENDING COMPLETION EMAIL TO:", testEmail);
        await sendEmail(testEmail, "Complaint Completed", message);
      } else {
        console.log("EMAIL DISABLED (DEV MODE)");
      }
    }

    res.json({ success: true, message: "Task marked as completed" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// 3. Toggle Availability
exports.toggleAvailability = async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await Worker.findById(workerId).select("-password");
    
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found" });
    }
    
    worker.available = !worker.available;
    await worker.save();
    
    res.status(200).json({ 
      success: true,
      message: "Availability updated", 
      data: { worker } 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Get All Workers (Admin)
exports.getAllWorkers = async (req, res) => {
  try {
    const workers = await Worker.find().select("-password");
    const formattedWorkers = workers.map(w => {
      const obj = w.toObject();
      obj.available = obj.tasksAssigned < 5;
      return obj;
    });

    res.json({
      success: true,
      data: formattedWorkers
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 GET WORKER STATS (ADMIN)
exports.getWorkerStats = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const workers = await Worker.find();

    const data = await Promise.all(
      workers.map(async (w) => {
        const completed = await Complaint.countDocuments({
          assignedTo: w._id,
          status: "completed"
        });

        return {
          id: w.workerId,
          name: w.name,
          tasksAssigned: w.tasksAssigned,
          completed,
          available: w.available
        };
      })
    );

    res.json({
      success: true,
      data
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};