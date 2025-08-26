const express = require("express");
const { protect } = require("../middleware/auth");
const { register, login, getMe, logout, updateProfile } = require("../controllers/authController");

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/update-profile", protect, updateProfile);

module.exports = router;
