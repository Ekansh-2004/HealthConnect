const express = require("express");
const { body, validationResult } = require("express-validator");
const { protect } = require("../middleware/auth");
const { register, login, getMe, logout, updateProfile } = require("../controllers/authController");

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
	"/register",
	[
		body("name")
			.trim()
			.isLength({ min: 2, max: 50 })
			.withMessage("Name must be between 2 and 50 characters")
			.matches(/^[a-zA-Z\s]+$/)
			.withMessage("Name can only contain letters and spaces"),

		body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),

		body("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters long")
			.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
			.withMessage("Password must contain at least one lowercase letter, one uppercase letter, and one number"),

		body("userType").isIn(["adult", "adolescent", "health_prof"]).withMessage("User type must be adult, adolescent, or health_prof"),

		body("confirmPassword").custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Password confirmation does not match password");
			}
			return true;
		}),
	],
	register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", [body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"), body("password").notEmpty().withMessage("Password is required")], login);

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get("/me", protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post("/logout", protect, logout);

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put(
	"/update-profile",
	protect,
	[
		body("name")
			.optional()
			.trim()
			.isLength({ min: 2, max: 50 })
			.withMessage("Name must be between 2 and 50 characters")
			.matches(/^[a-zA-Z\s]+$/)
			.withMessage("Name can only contain letters and spaces"),

		body("userType").optional().isIn(["adult", "adolescent", "health_prof"]).withMessage("User type must be adult, adolescent, or health_prof"),
	],
	updateProfile
);

module.exports = router;
