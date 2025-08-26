const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
	cors({
		origin: process.env.CLIENT_URL?.split(",") || ["http://localhost:3000"], // supports multiple origins
		credentials: true,
	})
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Security headers
app.use(helmet());

// Logging (only in development)
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/stories", require("./routes/stories"));

// Health check endpoint
app.get("/api/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "✅ Health Connect Backend is running!",
		environment: process.env.NODE_ENV,
		timestamp: new Date().toISOString(),
	});
});

// Handle 404 (Not Found)
app.use("*", (req, res) => {
	res.status(404).json({
		success: false,
		message: `Route ${req.originalUrl} not found`,
	});
});

// Global error handler
app.use((err, req, res, next) => {
	console.error("🔥 Server Error:", err);

	res.status(err.statusCode || 500).json({
		success: false,
		message: err.message || "Something went wrong!",
		error: process.env.NODE_ENV === "development" ? err.stack : "Internal server error",
	});
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
	console.log(`🚀 Server running on port ${PORT}`);
	console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});
