const Appointment = require("../models/Appointment");
const Schedule = require("../models/Schedule");
const User = require("../models/User");
const { sendAppointmentConfirmationEmail } = require("../utils/emailService");

// CREATE
exports.createAppointment = async (req, res) => {
  try {
    const { doctor, scheduleId, date, slotTime } = req.body;

    const schedule = await Schedule.findById(scheduleId);

    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    if (schedule.doctor.toString() !== doctor) {
      return res.status(400).json({ message: "Invalid doctor" });
    }

    // Find the requested slot in the schedule
    const slot = schedule.slots.find(s => s.startTime === slotTime);
    if (!slot) {
      return res.status(400).json({ message: "Invalid time slot" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Prevent the SAME patient from booking the same exact schedule slot twice
    const existingAppointment = await Appointment.findOne({
      patient: req.user.id,
      schedule: scheduleId,
      slotTime,
      status: { $ne: "cancelled" }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: "This time slot is already booked by you." });
    }

    // Mark slot as booked
    slot.isBooked = true;
    await schedule.save();

    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor,
      schedule: scheduleId,
      date,
      slotTime,
      consultationFee: schedule.consultationFee
    });

    res.status(201).json(appointment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 ADD THIS
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.user.id })
      .populate("doctor", "name email")
      .populate("schedule");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 ADD THIS
exports.getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      doctor: req.user.id,
      status: "confirmed" // Only show confirmed to doctors
    })
      .populate("patient", "name email")
      .populate("schedule");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 ADD THIS
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email")
      .populate("doctor", "name email");

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 ADD THIS
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name email")
      .populate("doctor", "name");

    if (!appointment) return res.status(404).json({ message: "Not found" });

    // Capture populated data BEFORE save() to prevent depopulation
    let patientEmail = appointment.patient?.email;
    let patientName = appointment.patient?.name;
    let doctorName = appointment.doctor?.name;

    // Fallback: if populate didn't return email, fetch directly from User collection
    if (!patientEmail && appointment.patient) {
      const patientUser = await User.findById(appointment.patient).select("name email");
      patientEmail = patientUser?.email;
      patientName = patientUser?.name;
    }
    if (!doctorName && appointment.doctor) {
      const doctorUser = await User.findById(appointment.doctor).select("name");
      doctorName = doctorUser?.name;
    }

    console.log("=== Appointment Confirmation ===");
    console.log("Status:", status);
    console.log("Patient email:", patientEmail || "NOT FOUND IN DATABASE");
    console.log("Patient name:", patientName);
    console.log("Doctor name:", doctorName);
    const appointmentDate = appointment.date;
    const appointmentSlot = appointment.slotTime;
    const appointmentFee = appointment.consultationFee || 0;

    appointment.status = status;
    await appointment.save();

    if (status === "confirmed") {
      const Billing = require("../models/Billing");
      const existingBilling = await Billing.findOne({ appointment: appointment._id });
      if (!existingBilling) {
        await Billing.create({
          patient: appointment.patient,
          appointment: appointment._id,
          consultationFee: appointmentFee,
          medicationTotal: 0,
          totalAmount: appointmentFee,
          status: "unpaid"
        });
      }

      console.log(`Sending confirmation email to: ${patientEmail}`);
      try {
        await sendAppointmentConfirmationEmail({
          patientEmail,
          patientName,
          doctorName,
          date: appointmentDate,
          time: appointmentSlot,
          fee: appointmentFee
        });
        console.log("Confirmation email sent successfully.");
      } catch (emailErr) {
        console.error("Email send failed:", emailErr.message);
        if (emailErr.response) console.error("SMTP response:", emailErr.response);
      }
    }

    if (status === "cancelled") {
      const Billing = require("../models/Billing");
      await Billing.findOneAndUpdate(
        { appointment: appointment._id },
        { status: "cancelled" }
      );

      // Free up the schedule slot
      if (appointment.schedule && appointment.slotTime) {
        const schedule = await Schedule.findById(appointment.schedule);
        if (schedule) {
          const slot = schedule.slots.find(s => s.startTime === appointment.slotTime);
          if (slot) {
            slot.isBooked = false;
            await schedule.save();
          }
        }
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESCHEDULE (Patient - only when pending)
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { scheduleId, date, slotTime } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    if (appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({ message: "Reschedule is only allowed before admin confirms the appointment" });
    }

    const newSchedule = await Schedule.findById(scheduleId);
    if (!newSchedule) return res.status(404).json({ message: "Schedule not found" });

    const newSlot = newSchedule.slots.find(s => s.startTime === slotTime);
    if (!newSlot) return res.status(400).json({ message: "Invalid time slot" });
    if (newSlot.isBooked) return res.status(400).json({ message: "This time slot is already booked" });

    // Free old slot
    if (appointment.schedule) {
      const oldSchedule = await Schedule.findById(appointment.schedule);
      if (oldSchedule) {
        const oldSlot = oldSchedule.slots.find(s => s.startTime === appointment.slotTime);
        if (oldSlot) {
          oldSlot.isBooked = false;
          await oldSchedule.save();
        }
      }
    }

    // Book new slot
    newSlot.isBooked = true;
    await newSchedule.save();

    appointment.schedule = scheduleId;
    appointment.date = date;
    appointment.slotTime = slotTime;
    appointment.consultationFee = newSchedule.consultationFee;
    await appointment.save();

    res.json({ message: "Appointment rescheduled successfully", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL REQUEST (Patient)
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    // Request to cancel
    appointment.status = "cancel_requested";
    await appointment.save();

    res.json({ message: "Cancellation request sent to admin", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
