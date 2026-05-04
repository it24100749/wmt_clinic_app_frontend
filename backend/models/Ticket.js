const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  issue: String,
  status: {
    type: String,
    enum: ["open", "in-progress", "closed"],
    default: "open"
  },
  response: String
}, { timestamps: true });

module.exports = mongoose.model("Ticket", ticketSchema);