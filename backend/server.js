const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_URL || "http://localhost:3000",
		credentials: true,
	})
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/stories", require("./routes/stories"));

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Health Connect Backend is running!",
		timestamp: new Date().toISOString(),
	});
});

// Global error handler
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: "Something went wrong!",
		error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
	});
});

// Handle 404 routes
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`🚀 Health Connect Backend running on port ${PORT}`);
	console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
