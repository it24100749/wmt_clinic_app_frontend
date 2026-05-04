const express = require("express");
const router = express.Router();

const {
  createAppointment,
  getMyAppointments,
  getDoctorAppointments,
  getAllAppointments,
  updateAppointmentStatus,
  cancelAppointment,
  rescheduleAppointment
} = require("../controllers/appointmentController");

const { protect, authorizeRoles } = require("../middlewear/authMiddlewear");

// Patient
router.post("/", protect, authorizeRoles("patient"), createAppointment);
router.get("/my", protect, authorizeRoles("patient"), getMyAppointments);

// Admin / Doctor
router.get("/", protect, authorizeRoles("admin", "doctor"), getAllAppointments);
router.get("/doctor", protect, authorizeRoles("doctor"), getDoctorAppointments);
router.put("/:id", protect, authorizeRoles("admin"), updateAppointmentStatus);

// Cancel (MUST be before /:id)
router.put("/cancel/:id", protect, authorizeRoles("patient"), cancelAppointment);

// Reschedule (MUST be before /:id)
router.put("/reschedule/:id", protect, authorizeRoles("patient"), rescheduleAppointment);

module.exports = router;
