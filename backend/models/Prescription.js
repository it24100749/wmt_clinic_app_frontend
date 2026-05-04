const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },

  medicines: [
    {
      name: String,
      dosage: String,
      duration: String,
      price: Number
    }
  ],

  notes: String,
  status: {
    type: String,
    enum: ["pending", "dispensed"],
    default: "pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Prescription", prescriptionSchema);