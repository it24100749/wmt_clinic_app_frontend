const express = require("express");
const router = express.Router();
const { registerUser, loginUser, createUser, getUserProfile, getAllUsers, getDoctors, updateUser, deleteUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

const { protect, authorizeRoles } = require("../middlewear/authMiddlewear");
router.get("/me", protect, getUserProfile);

router.get("/users", protect, authorizeRoles("admin"), getAllUsers);
router.post("/users", protect, authorizeRoles("admin"), createUser);
router.put("/users/:id", protect, authorizeRoles("admin"), updateUser);
router.delete("/users/:id", protect, authorizeRoles("admin"), deleteUser);

router.get("/doctors", protect, getDoctors);

module.exports = router;