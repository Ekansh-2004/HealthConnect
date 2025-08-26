const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

// Generate JWT token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || "7d",
	});
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { name, email, password, userType } = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User already exists with this email address",
			});
		}

		// Create user
		const user = await User.create({
			name,
			email,
			password,
			userType,
		});

		// Generate token
		const token = generateToken(user._id);

		res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					isEmailVerified: user.isEmailVerified,
					createdAt: user.createdAt,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Registration error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during registration",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { email, password } = req.body;

		// Find user and include password field
		const user = await User.findOne({ email }).select("+password");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Check if account is locked
		if (user.isLocked) {
			return res.status(423).json({
				success: false,
				message: "Account is temporarily locked due to too many failed login attempts. Please try again later.",
			});
		}

		// Check if account is active
		if (!user.isActive) {
			return res.status(401).json({
				success: false,
				message: "Account is deactivated. Please contact support.",
			});
		}

		// Check password
		const isPasswordCorrect = await user.comparePassword(password);

		if (!isPasswordCorrect) {
			// Increment login attempts
			await user.incLoginAttempts();

			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		// Reset login attempts and update last login
		await User.findByIdAndUpdate(user._id, {
			$unset: { loginAttempts: 1, lockUntil: 1 },
			$set: { lastLogin: new Date() },
		});

		// Generate token
		const token = generateToken(user._id);

		res.status(200).json({
			success: true,
			message: "Login successful",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					isEmailVerified: user.isEmailVerified,
					lastLogin: new Date(),
					createdAt: user.createdAt,
				},
				token,
			},
		});
	} catch (error) {
		console.error("Login error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during login",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);

		res.status(200).json({
			success: true,
			message: "User profile retrieved successfully",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					isEmailVerified: user.isEmailVerified,
					lastLogin: user.lastLogin,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Get profile error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while retrieving profile",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
	try {
		// In a stateless JWT system, logout is handled client-side by removing the token
		// We can optionally log this event or add to a token blacklist for extra security

		res.status(200).json({
			success: true,
			message: "Logout successful. Please remove the token from client storage.",
		});
	} catch (error) {
		console.error("Logout error:", error);
		res.status(500).json({
			success: false,
			message: "Server error during logout",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res) => {
	try {
		// Check for validation errors
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { name, userType } = req.body;
		const updateFields = {};

		if (name) updateFields.name = name;
		if (userType) updateFields.userType = userType;

		const user = await User.findByIdAndUpdate(req.user.id, updateFields, { new: true, runValidators: true });

		res.status(200).json({
			success: true,
			message: "Profile updated successfully",
			data: {
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					userType: user.userType,
					isEmailVerified: user.isEmailVerified,
					lastLogin: user.lastLogin,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				},
			},
		});
	} catch (error) {
		console.error("Update profile error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating profile",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

module.exports = {
	register,
	login,
	getMe,
	logout,
	updateProfile,
};
