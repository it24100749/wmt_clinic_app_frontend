const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));

app.get("/", (req, res) => {
  res.send("API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { protect, authorizeRoles } = require("./middlewear/authMiddlewear");

app.get("/api/test", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
  
});
app.get("/api/admin", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

app.use("/api/appointments", require("./routes/appointmentRoutes"));

// Test email endpoint - open http://localhost:5000/api/test-email in browser
app.get("/api/test-email", async (req, res) => {
  const { sendAppointmentConfirmationEmail } = require("./utils/emailService");
  try {
    await sendAppointmentConfirmationEmail({
      patientEmail: process.env.EMAIL_USER,
      patientName: "Test Patient",
      doctorName: "Dr. Test Doctor",
      date: new Date(),
      time: "09:00 AM",
      fee: 500
    });
    res.json({ success: true, message: "Test email sent to " + process.env.EMAIL_USER });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use("/api/emr", require("./routes/emrRoutes"));

app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));

app.use("/api/billing", require("./routes/billingRoutes"));

app.use("/api/schedule", require("./routes/scheduleRoutes"));

app.use("/api/support", require("./routes/feedbackRoutes"));

app.use("/api/leave", require("./routes/leaveRoutes"));
