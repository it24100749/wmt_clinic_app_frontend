const express = require("express");
const router = express.Router();

const {
  createEMR,
  getPatientEMR,
  getAllEMR
} = require("../controllers/emrController");

const { protect, authorizeRoles } = require("../middlewear/authMiddlewear");

// Doctor creates EMR
router.post("/", protect, authorizeRoles("doctor"), createEMR);

// Get by appointment
router.get("/appointment/:appointmentId", protect, require("../controllers/emrController").getEMRByAppointment);

// Patient / Doctor view patient records
router.get("/:patientId", protect, getPatientEMR);

// Doctor update/delete EMR
router.put("/:id", protect, authorizeRoles("doctor"), require("../controllers/emrController").updateEMR);
router.delete("/:id", protect, authorizeRoles("doctor"), require("../controllers/emrController").deleteEMR);

// Admin view all
router.get("/", protect, authorizeRoles("admin"), getAllEMR);

module.exports = router;