const EMR = require("../models/EMR");

// CREATE EMR
exports.createEMR = async (req, res) => {
  try {
    const { appointment, patient, diagnosis, symptoms, treatment, notes } = req.body;

    const emr = await EMR.create({
      patient: patient,
      doctor: req.user.id,
      appointment,
      diagnosis,
      symptoms,
      treatment,
      notes
    });

    res.status(201).json(emr);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EMR for a patient
exports.getPatientEMR = async (req, res) => {
  try {
    const records = await EMR.find({ patient: req.params.patientId })
      .populate("doctor", "name email");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE EMR
exports.updateEMR = async (req, res) => {
  try {
    const { diagnosis, symptoms, treatment, notes } = req.body;
    const emr = await EMR.findByIdAndUpdate(
      req.params.id,
      { diagnosis, symptoms, treatment, notes },
      { new: true }
    );
    if (!emr) return res.status(404).json({ message: "Record not found" });
    res.json(emr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE EMR
exports.deleteEMR = async (req, res) => {
  try {
    const emr = await EMR.findByIdAndDelete(req.params.id);
    if (!emr) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET EMR by Appointment
exports.getEMRByAppointment = async (req, res) => {
  try {
    const emr = await EMR.findOne({ appointment: req.params.appointmentId });
    res.json(emr);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all EMRs (Admin)
exports.getAllEMR = async (req, res) => {
  try {
    const records = await EMR.find()
      .populate("patient", "name email")
      .populate("doctor", "name email");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};