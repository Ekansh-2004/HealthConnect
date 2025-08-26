const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
	{
		patient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Patient is required"],
		},
		healthProfessional: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Health professional is required"],
		},
		appointmentDate: {
			type: Date,
			required: [true, "Appointment date is required"],
			validate: {
				validator: function (date) {
					return date > new Date();
				},
				message: "Appointment date must be in the future",
			},
		},
		appointmentTime: {
			type: String,
			required: [true, "Appointment time is required"],
			match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please provide time in HH:MM format"],
		},
		description: {
			type: String,
			required: [true, "Brief description is required"],
			trim: true,
			maxLength: [500, "Description cannot exceed 500 characters"],
			minLength: [10, "Description must be at least 10 characters long"],
		},
		status: {
			type: String,
			enum: {
				values: ["pending", "accepted", "rejected", "completed", "cancelled"],
				message: "Status must be pending, accepted, rejected, completed, or cancelled",
			},
			default: "pending",
		},
		rejectionReason: {
			type: String,
			trim: true,
			maxLength: [200, "Rejection reason cannot exceed 200 characters"],
		},
		notes: {
			type: String,
			trim: true,
			maxLength: [1000, "Notes cannot exceed 1000 characters"],
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
	{
		timestamps: true,
		toJSON: {
			transform: function (doc, ret) {
				delete ret.__v;
				return ret;
			},
		},
	}
);

// Indexes for better query performance
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ healthProfessional: 1, status: 1 });
appointmentSchema.index({ appointmentDate: 1, status: 1 });

// Virtual for formatted appointment datetime
appointmentSchema.virtual("formattedDateTime").get(function () {
	const date = this.appointmentDate.toDateString();
	return `${date} at ${this.appointmentTime}`;
});

// Pre-save middleware to validate appointment conflicts
appointmentSchema.pre("save", async function (next) {
	if (this.isNew || this.isModified("appointmentDate") || this.isModified("appointmentTime")) {
		// Check for conflicting appointments for the health professional
		const conflictingAppointment = await this.constructor.findOne({
			healthProfessional: this.healthProfessional,
			appointmentDate: this.appointmentDate,
			appointmentTime: this.appointmentTime,
			status: { $in: ["pending", "accepted"] },
			_id: { $ne: this._id },
		});

		if (conflictingAppointment) {
			const error = new Error("Health professional already has an appointment at this time");
			error.name = "ValidationError";
			return next(error);
		}
	}
	next();
});

module.exports = mongoose.model("Appointment", appointmentSchema);
