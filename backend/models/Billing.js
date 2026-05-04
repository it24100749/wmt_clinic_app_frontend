const mongoose = require("mongoose");

const billingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment"
  },

  consultationFee: Number,
  medicationTotal: Number,
  totalAmount: Number,

  status: {
    type: String,
    enum: ["unpaid", "paid", "failed"],
    default: "unpaid"
  },
  transactionId: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Billing", billingSchema);