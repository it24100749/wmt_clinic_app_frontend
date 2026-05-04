const Feedback = require("../models/Feedback");
const Ticket = require("../models/Ticket");

// SUBMIT FEEDBACK
exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      user: req.user.id,
      message: req.body.message
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL FEEDBACK (Admin)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE TICKET
exports.createTicket = async (req, res) => {
  try {
    const ticket = await Ticket.create({
      user: req.user.id,
      issue: req.body.issue
    });

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL TICKETS (Admin)
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET MY TICKETS (Patient)
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE TICKET (Admin)
exports.updateTicket = async (req, res) => {
  try {
    const { status, response } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status, response },
      { new: true }
    );

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE FEEDBACK (Admin)
exports.deleteFeedback = async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE TICKET (Admin)
exports.deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};