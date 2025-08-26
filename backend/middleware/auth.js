const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
	try {
		let token;

		// Check for token in header
		if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		// Make sure token exists
		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Not authorized to access this resource - No token provided",
			});
		}

		try {
			// Verify token
			const decoded = jwt.verify(token, process.env.JWT_SECRET);

			// Find user by id
			const user = await User.findById(decoded.id).select("-password");

			if (!user) {
				return res.status(401).json({
					success: false,
					message: "User not found - Token is invalid",
				});
			}

			if (!user.isActive) {
				return res.status(401).json({
					success: false,
					message: "Account is deactivated",
				});
			}

			// Add user to request object
			req.user = user;
			next();
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: "Not authorized to access this resource - Invalid token",
			});
		}
	} catch (error) {
		console.error("Auth middleware error:", error);
		return res.status(500).json({
			success: false,
			message: "Server error during authentication",
		});
	}
};

// Authorize specific user types
const authorize = (...userTypes) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "User not authenticated",
			});
		}

		if (!userTypes.includes(req.user.userType)) {
			return res.status(403).json({
				success: false,
				message: `User type '${req.user.userType}' is not authorized to access this resource`,
			});
		}

		next();
	};
};

module.exports = { protect, authorize };
