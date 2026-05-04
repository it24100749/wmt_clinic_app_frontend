const LeaveRequest = require("../models/LeaveRequest");

// DOCTOR: Create leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const { date, reason } = req.body;
    const leaveRequest = await LeaveRequest.create({
      doctor: req.user.id,
      date,
      reason
    });
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOCTOR: Get my leave requests
exports.getMyLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find({ doctor: req.user.id }).sort({ date: 1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: Get all leave requests
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const leaveRequests = await LeaveRequest.find().populate("doctor", "name email").sort({ createdAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: Update leave request status
exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leaveRequest = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }
    res.json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
