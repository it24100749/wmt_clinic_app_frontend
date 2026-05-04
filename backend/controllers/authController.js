const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

// REGISTER
exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient" // Self-registration is only for patients
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE USER (Admin only)
exports.createUser = async (req, res) => {
    const { name, email, password, role, specialization } = req.body;
    console.log("Creating user:", { name, email, role, specialization });
  
    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log("User already exists:", email);
        return res.status(400).json({ message: "User already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role,
        specialization: role === "doctor" ? specialization : ""
      });
  
      console.log("User created successfully:", user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET USER PROFILE
exports.getUserProfile = async (req, res) => {
  try {
    const user = await require("../models/User").findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL USERS (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await require("../models/User").find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL DOCTORS
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await require("../models/User")
      .find({ role: "doctor" })
      .select("-password");

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE USER (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, specialization } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    
    if (user.role === "doctor") {
      user.specialization = specialization || user.specialization;
    } else {
      user.specialization = "";
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      specialization: updatedUser.specialization
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE USER (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Cascading deletion logic for doctors
    if (user.role === "doctor") {
      const Schedule = require("../models/Schedule");
      const Appointment = require("../models/Appointment");

      // 1. Delete all schedules for this doctor
      await Schedule.deleteMany({ doctor: user._id });

      // 2. Cancel all upcoming appointments for this doctor
      await Appointment.updateMany(
        { doctor: user._id, status: { $in: ["pending", "confirmed"] } },
        { $set: { status: "cancelled" } }
      );
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};