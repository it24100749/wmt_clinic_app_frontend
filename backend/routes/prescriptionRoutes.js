const express = require("express");
const router = express.Router();

const {
  createPrescription,
  getMyPrescriptions,
  getAllPrescriptions
} = require("../controllers/prescriptionController");

const { protect, authorizeRoles } = require("../middlewear/authMiddlewear");

// Doctor create
router.post("/", protect, authorizeRoles("doctor"), createPrescription);

// Get by appointment
router.get("/appointment/:appointmentId", protect, require("../controllers/prescriptionController").getPrescriptionByAppointment);

// Patient view
router.get("/my", protect, authorizeRoles("patient"), getMyPrescriptions);

// Doctor view patient history
router.get("/patient/:patientId", protect, authorizeRoles("doctor"), require("../controllers/prescriptionController").getPatientPrescriptions);

// Pharmacist / Admin
router.get("/", protect, authorizeRoles("pharmacist", "admin"), getAllPrescriptions);
router.put("/:id/dispense", protect, authorizeRoles("pharmacist"), require("../controllers/prescriptionController").dispensePrescription);

// Doctor update/delete
router.put("/:id", protect, authorizeRoles("doctor"), require("../controllers/prescriptionController").updatePrescription);
router.delete("/:id", protect, authorizeRoles("doctor"), require("../controllers/prescriptionController").deletePrescription);

module.exports = router;