const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register
const register = async (req, res) => {
	try {
		const { name, email, password, userType } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) return res.status(400).json({ success: false, message: "Email already in use" });

		const user = await User.create({ name, email, password, userType });
		const token = generateToken(user._id);

		res.status(201).json({ success: true, data: { user, token } });
	} catch (err) {
		res.status(500).json({ success: false, message: "Registration failed" });
	}
};

// Login
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select("+password");
		if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

		const isMatch = await user.comparePassword(password);
		if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

		const token = generateToken(user._id);
		res.json({ success: true, data: { user, token } });
	} catch (err) {
		res.status(500).json({ success: false, message: "Login failed" });
	}
};

// Get current user
const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		res.json({ success: true, data: user });
	} catch (err) {
		res.status(500).json({ success: false, message: "Could not fetch user" });
	}
};

// Logout
const logout = async (_req, res) => {
	res.json({ success: true, message: "Logged out" });
};

// Update profile
const updateProfile = async (req, res) => {
	try {
		const { name, userType } = req.body;
		const user = await User.findByIdAndUpdate(req.user.id, { name, userType }, { new: true, runValidators: true });

		res.json({ success: true, data: user });
	} catch (err) {
		res.status(500).json({ success: false, message: "Update failed" });
	}
};

module.exports = { register, login, getMe, logout, updateProfile };
