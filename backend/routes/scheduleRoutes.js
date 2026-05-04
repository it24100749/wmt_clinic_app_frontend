const express = require("express");
const router = express.Router();

const {
  createSchedule,
  getAllSchedules,
  updateSchedule,
  deleteSchedule,
  getMySchedule,
  getDoctorSchedule
} = require("../controllers/scheduleController");

const { protect, authorizeRoles } = require("../middlewear/authMiddlewear");

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllSchedules);
router.post("/", protect, authorizeRoles("admin"), createSchedule);
router.put("/:id", protect, authorizeRoles("admin"), updateSchedule);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSchedule);

// Doctor view own
router.get("/my", protect, authorizeRoles("doctor"), getMySchedule);

// Patient view doctor schedule
router.get("/:doctorId", protect, getDoctorSchedule);

module.exports = router;