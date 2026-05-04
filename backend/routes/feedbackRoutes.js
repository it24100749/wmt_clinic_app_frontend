const express = require("express");
const router = express.Router();

const {
  createFeedback,
  getAllFeedback,
  createTicket,
  getAllTickets,
  getMyTickets,
  updateTicket,
  deleteFeedback,
  deleteTicket
} = require("../controllers/feedbackController");

const { protect, authorizeRoles } = require("../middlewear/authMiddlewear");

// Feedback
router.post("/feedback", protect, createFeedback);
router.get("/feedback", protect, authorizeRoles("admin"), getAllFeedback);
router.delete("/feedback/:id", protect, authorizeRoles("admin"), deleteFeedback);

// Tickets
router.post("/tickets", protect, createTicket);
router.get("/tickets", protect, authorizeRoles("admin"), getAllTickets);
router.get("/my-tickets", protect, getMyTickets);
router.put("/tickets/:id", protect, authorizeRoles("admin"), updateTicket);
router.delete("/tickets/:id", protect, authorizeRoles("admin"), deleteTicket);

module.exports = router;