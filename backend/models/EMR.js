const mongoose = require("mongoose");

const emrSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },

  diagnosis: String,
  symptoms: String,
  treatment: String,
  notes: String

}, { timestamps: true });

module.exports = mongoose.model("EMR", emrSchema);