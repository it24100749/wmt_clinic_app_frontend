const express = require("express");
const router = express.Router();

const {
  createLeaveRequest,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveRequestStatus
} = require("../controllers/leaveController");

const { protect, authorizeRoles } = require("../middlewear/authMiddlewear");

// Doctor routes
router.post("/", protect, authorizeRoles("doctor"), createLeaveRequest);
router.get("/my", protect, authorizeRoles("doctor"), getMyLeaveRequests);

// Admin routes
router.get("/", protect, authorizeRoles("admin"), getAllLeaveRequests);
router.put("/:id", protect, authorizeRoles("admin"), updateLeaveRequestStatus);

module.exports = router;
