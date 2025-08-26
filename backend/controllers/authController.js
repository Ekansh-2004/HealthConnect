const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register
const register = async (req, res) => {
	try {
		const { name, email, password, userType } = req.body;

		// Input validation
		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Please provide name, email and password",
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters long",
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "Email already in use",
			});
		}

		// Hash password before storing
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create user with hashed password
		const user = await User.create({
			name: name.trim(),
			email: email.toLowerCase(),
			password: hashedPassword,
			userType,
		});

		// Generate token
		const token = generateToken(user._id);

		// Remove password from response
		const userResponse = {
			_id: user._id,
			name: user.name,
			email: user.email,
			userType: user.userType,
			isActive: user.isActive,
		};

		res.status(201).json({
			success: true,
			data: { user: userResponse, token },
		});
	} catch (err) {
		console.error("Registration error:", err);
		res.status(500).json({
			success: false,
			message: "Registration failed",
		});
	}
};

// Login
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// Input validation
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "Please provide email and password",
			});
		}

		// Find user by email and include password for comparison
		const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

		// Check if user exists and password is correct
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({
				success: false,
				message: "Invalid credentials",
			});
		}

		// Check if account is active
		if (!user.isActive) {
			return res.status(403).json({
				success: false,
				message: "Account is deactivated",
			});
		}

		// Update last login timestamp
		user.lastLoginAt = new Date();
		await user.save();

		// Generate token
		const token = generateToken(user._id);

		// Remove password from response
		const userResponse = {
			_id: user._id,
			name: user.name,
			email: user.email,
			userType: user.userType,
			isActive: user.isActive,
			lastLoginAt: user.lastLoginAt,
		};

		res.json({
			success: true,
			data: { user: userResponse, token },
		});
	} catch (err) {
		console.error("Login error:", err);
		res.status(500).json({
			success: false,
			message: "Login failed",
		});
	}
};

// Get current user
const getMe = async (req, res) => {
	try {
		// req.user is already available from protect middleware
		// No need to query database again unless you need fresh data
		const user = await User.findById(req.user.id).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.json({ success: true, data: user });
	} catch (err) {
		console.error("Get user error:", err);
		res.status(500).json({
			success: false,
			message: "Could not fetch user",
		});
	}
};

// Logout (client-side token removal, optionally implement token blacklisting)
const logout = async (req, res) => {
	try {
		// In a more secure implementation, you might:
		// 1. Add the token to a blacklist/blocklist
		// 2. Store blacklisted tokens in Redis with TTL
		// 3. Check blacklist in the protect middleware

		// For now, simple response (client should remove token)
		res.json({
			success: true,
			message: "Logged out successfully",
		});
	} catch (err) {
		console.error("Logout error:", err);
		res.status(500).json({
			success: false,
			message: "Logout failed",
		});
	}
};

// Update profile
const updateProfile = async (req, res) => {
	try {
		const { name, userType } = req.body;

		// Input validation
		if (!name) {
			return res.status(400).json({
				success: false,
				message: "Name is required",
			});
		}

		// Prepare update object
		const updateData = { name: name.trim() };

		// Only allow certain user types to be updated, or restrict based on current user role
		if (userType && req.user.userType === "admin") {
			updateData.userType = userType;
		}

		// Update user
		const user = await User.findByIdAndUpdate(req.user.id, updateData, {
			new: true,
			runValidators: true,
		}).select("-password");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		res.json({ success: true, data: user });
	} catch (err) {
		console.error("Update profile error:", err);
		res.status(500).json({
			success: false,
			message: "Update failed",
		});
	}
};

// Change password
const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res.status(400).json({
				success: false,
				message: "Please provide current and new password",
			});
		}

		if (newPassword.length < 6) {
			return res.status(400).json({
				success: false,
				message: "New password must be at least 6 characters long",
			});
		}

		// Get user with password
		const user = await User.findById(req.user.id).select("+password");

		// Verify current password
		if (!(await bcrypt.compare(currentPassword, user.password))) {
			return res.status(400).json({
				success: false,
				message: "Current password is incorrect",
			});
		}

		// Hash new password
		const salt = await bcrypt.genSalt(12);
		const hashedPassword = await bcrypt.hash(newPassword, salt);

		// Update password and passwordChangedAt
		user.password = hashedPassword;
		user.passwordChangedAt = new Date();
		await user.save();

		res.json({
			success: true,
			message: "Password changed successfully",
		});
	} catch (err) {
		console.error("Change password error:", err);
		res.status(500).json({
			success: false,
			message: "Password change failed",
		});
	}
};

module.exports = {
	register,
	login,
	getMe,
	logout,
	updateProfile,
	changePassword,
};
