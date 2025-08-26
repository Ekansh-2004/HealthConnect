const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
	{
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		healthProfessional: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		appointmentDate: {
			type: Date,
			required: true,
		},
		appointmentTime: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			maxLength: 500,
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
			default: "pending",
		},
		rejectionReason: {
			type: String,
			trim: true,
			maxLength: 200,
		},
		notes: {
			type: String,
			trim: true,
			maxLength: 1000,
		},
		meetingLink: {
			type: String,
			trim: true,
		},
		isUrgent: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
