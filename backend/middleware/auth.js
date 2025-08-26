const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token from cookie or header
const protect = async (req, res, next) => {
	try {
		let token;

		// Check for token in cookie first, then header
		if (req.cookies.jwt) {
			token = req.cookies.jwt;
		} else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
			token = req.headers.authorization.split(" ")[1];
		}

		// Make sure token exists
		if (!token) {
			return res.status(401).json({
				success: false,
				message: "Not authorized to access this resource",
			});
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Find user by id
		const user = await User.findById(decoded.id).select("-password");

		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Not authorized to access this resource",
			});
		}

		if (!user.isActive) {
			return res.status(403).json({
				success: false,
				message: "Account is deactivated",
			});
		}

		// Check if token was issued before any password reset
		if (user.passwordChangedAt) {
			const passwordChangedTimestamp = parseInt(user.passwordChangedAt.getTime() / 1000, 10);

			if (decoded.iat < passwordChangedTimestamp) {
				return res.status(401).json({
					success: false,
					message: "Not authorized to access this resource",
				});
			}
		}

		// Add user to request object
		req.user = user;
		next();
	} catch (error) {
		console.error("Auth middleware error:", error);

		return res.status(401).json({
			success: false,
			message: "Not authorized to access this resource",
		});
	}
};

// Authorize specific user types
const authorize = (...userTypes) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		if (!userTypes.includes(req.user.userType)) {
			return res.status(403).json({
				success: false,
				message: "Insufficient privileges to access this resource",
			});
		}

		next();
	};
};

module.exports = { protect, authorize };
