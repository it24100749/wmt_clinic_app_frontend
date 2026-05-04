const Prescription = require("../models/Prescription");
const Billing = require("../models/Billing");

// CREATE Prescription
exports.createPrescription = async (req, res) => {
  try {
    const { appointment, patient, medicines, notes } = req.body;

    // 1. Validation: Ensure at least one medicine is provided
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return res.status(400).json({ message: "A prescription must contain at least one medicine." });
    }

    // 2. Validation: Ensure only one prescription per appointment
    const existingPrescription = await Prescription.findOne({ appointment });
    if (existingPrescription) {
      return res.status(400).json({ message: "A prescription has already been created for this appointment." });
    }

    const prescription = await Prescription.create({
      patient: patient,
      doctor: req.user.id,
      appointment,
      medicines,
      notes
    });

    res.status(201).json(prescription);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET My Prescriptions (Patient)
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.user.id })
      .populate("doctor", "name email");

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL (Pharmacist / Admin)
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate("patient", "name email")
      .populate("doctor", "name email");

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DISPENSE Prescription (Pharmacist)
exports.dispensePrescription = async (req, res) => {
  try {
    const { medicines } = req.body; // medicines array with prices

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    // 3. Validation: Prevent re-dispensing
    if (prescription.status === "dispensed") {
      return res.status(400).json({ message: "This prescription has already been dispensed." });
    }

    // 4. Validation & Update: Ensure valid prices and update medicines
    let medicationTotal = 0;
    const updatedMedicines = prescription.medicines.map(med => {
      const updatedMed = medicines.find(m => m._id === med._id.toString() || m.name === med.name);
      const price = updatedMed ? updatedMed.price : 0;

      if (price <= 0) {
        throw new Error(`Invalid price for medicine: ${med.name}. Price must be greater than 0.`);
      }

      medicationTotal += Number(price);
      return { ...med.toObject(), price };
    });

    prescription.medicines = updatedMedicines;
    prescription.status = "dispensed";
    await prescription.save();

    // Update the Billing record
    const billing = await Billing.findOne({ appointment: prescription.appointment });
    if (billing) {
      billing.medicationTotal = medicationTotal;
      billing.totalAmount = (billing.consultationFee || 0) + medicationTotal;
      await billing.save();
    } else {
      // If no billing exists (fallback), create one
      const Appointment = require("../models/Appointment");
      const appt = await Appointment.findById(prescription.appointment);
      const consultationFee = appt ? (appt.consultationFee || 0) : 0;

      await Billing.create({
        patient: prescription.patient,
        appointment: prescription.appointment,
        consultationFee: consultationFee,
        medicationTotal,
        totalAmount: consultationFee + medicationTotal
      });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE Prescription
exports.updatePrescription = async (req, res) => {
  try {
    const { medicines, notes } = req.body;
    
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    // 1. Validation: Prevent update if already dispensed
    if (prescription.status === "dispensed") {
      return res.status(400).json({ message: "Dispensed prescriptions cannot be updated." });
    }

    // 2. Validation: Only the original doctor can update
    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this prescription." });
    }

    prescription.medicines = medicines || prescription.medicines;
    prescription.notes = notes || prescription.notes;
    
    await prescription.save();
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE Prescription
exports.deletePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) return res.status(404).json({ message: "Prescription not found" });

    // 1. Validation: Prevent delete if already dispensed
    if (prescription.status === "dispensed") {
      return res.status(400).json({ message: "Dispensed prescriptions cannot be deleted." });
    }

    // 2. Validation: Only the original doctor can delete
    if (prescription.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this prescription." });
    }

    await Prescription.findByIdAndDelete(req.params.id);
    res.json({ message: "Prescription deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Prescription by Appointment
exports.getPrescriptionByAppointment = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ appointment: req.params.appointmentId });
    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET Patient Prescriptions (for Doctors)
exports.getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate("doctor", "name email")
      .populate("patient", "name email");
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};