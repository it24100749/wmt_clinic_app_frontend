const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Schedule"
  },

  date: Date,
  slotTime: String,

  consultationFee: Number,

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "cancel_requested"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);