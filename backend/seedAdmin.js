require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    const existingAdmin = await User.findOne({ email: "admin@clinic.com" });
    if (existingAdmin) {
      console.log("Admin account already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = await User.create({
      name: "Super Admin",
      email: "admin@clinic.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully:", adminUser.email);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

seedAdmin();
