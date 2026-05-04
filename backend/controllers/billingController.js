const Billing = require("../models/Billing");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.generateBill = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const prescription = await Prescription.findOne({
      appointment: appointmentId
    });

    let medicationTotal = 0;

    if (prescription) {
      medicationTotal = prescription.medicines.reduce(
        (sum, med) => sum + (med.price || 0),
        0
      );
    }

    const totalAmount = appointment.consultationFee + medicationTotal;

    const bill = await Billing.create({
      patient: appointment.patient,
      appointment: appointmentId,
      consultationFee: appointment.consultationFee,
      medicationTotal,
      totalAmount
    });

    res.status(201).json(bill);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET MY BILLS (Patient)
exports.getMyBills = async (req, res) => {
  try {
    const bills = await Billing.find({ patient: req.user.id });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL (Admin)
exports.getAllBills = async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate("patient", "name email");

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PAYMENT STATUS
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PAY BILL (Patient Gateway Mock)
exports.payBill = async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    if (bill.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to pay this bill" });
    }
    if (bill.status === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }

    // Mock payment gateway delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success and generate transaction ID
    bill.status = "paid";
    bill.transactionId = "TXN" + Math.random().toString(36).substr(2, 9).toUpperCase();
    await bill.save();

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE STRIPE PAYMENT INTENT
exports.createPaymentIntent = async (req, res) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    if (bill.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to pay this bill" });
    }
    if (bill.status === "paid") {
      return res.status(400).json({ message: "Bill already paid" });
    }

    // Amount in cents/paise
    const amount = Math.round(bill.totalAmount * 100);

    // Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "inr", // Use 'usd' or 'inr' depending on Stripe account
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};