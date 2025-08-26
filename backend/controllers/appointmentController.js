const { validationResult } = require("express-validator");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

// @desc    Create a new appointment request
// @route   POST /api/appointments
// @access  Private (Adult, Adolescent)
const createAppointment = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { healthProfessionalId, appointmentDate, appointmentTime, description, isUrgent } = req.body;

		// Verify health professional exists and is active
		const healthProfessional = await User.findOne({
			_id: healthProfessionalId,
			userType: "health_prof",
			isActive: true,
		});

		if (!healthProfessional) {
			return res.status(404).json({
				success: false,
				message: "Health professional not found or inactive",
			});
		}

		// Create appointment
		const appointment = await Appointment.create({
			patient: req.user.id,
			healthProfessional: healthProfessionalId,
			appointmentDate,
			appointmentTime,
			description,
			isUrgent: isUrgent || false,
		});

		// Populate the appointment with user details
		await appointment.populate([
			{ path: "patient", select: "name email userType" },
			{ path: "healthProfessional", select: "name email" },
		]);

		res.status(201).json({
			success: true,
			message: "Appointment request created successfully",
			data: { appointment },
		});
	} catch (error) {
		console.error("Create appointment error:", error);

		if (error.name === "ValidationError") {
			return res.status(400).json({
				success: false,
				message: error.message,
			});
		}

		res.status(500).json({
			success: false,
			message: "Server error while creating appointment",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Get appointments (filtered by user role)
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { status, page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		// Build query based on user type
		let query = {};

		if (req.user.userType === "health_prof") {
			query.healthProfessional = req.user.id;
		} else {
			query.patient = req.user.id;
		}

		if (status) {
			query.status = status;
		}

		// Get appointments with pagination
		const appointments = await Appointment.find(query).populate("patient", "name email userType").populate("healthProfessional", "name email").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

		const total = await Appointment.countDocuments(query);

		res.status(200).json({
			success: true,
			message: "Appointments retrieved successfully",
			data: {
				appointments,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(total / limit),
					totalAppointments: total,
					hasNextPage: page * limit < total,
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		console.error("Get appointments error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while retrieving appointments",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Update appointment status (accept/reject by health professional)
// @route   PUT /api/appointments/:id/status
// @access  Private (Health Professional only)
const updateAppointmentStatus = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { status, rejectionReason, notes, meetingLink } = req.body;

		// Find appointment
		const appointment = await Appointment.findOne({
			_id: req.params.id,
			healthProfessional: req.user.id,
		}).populate("patient", "name email");

		if (!appointment) {
			return res.status(404).json({
				success: false,
				message: "Appointment not found or you are not authorized to update it",
			});
		}

		// Validate status transition
		if (appointment.status === "completed" || appointment.status === "cancelled") {
			return res.status(400).json({
				success: false,
				message: "Cannot update status of completed or cancelled appointments",
			});
		}

		// Update appointment
		const updateData = { status };

		if (status === "rejected" && rejectionReason) {
			updateData.rejectionReason = rejectionReason;
		}

		if (notes) updateData.notes = notes;
		if (meetingLink) updateData.meetingLink = meetingLink;

		const updatedAppointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate([
			{ path: "patient", select: "name email userType" },
			{ path: "healthProfessional", select: "name email" },
		]);

		res.status(200).json({
			success: true,
			message: `Appointment ${status} successfully`,
			data: { appointment: updatedAppointment },
		});
	} catch (error) {
		console.error("Update appointment status error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while updating appointment status",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Get list of available health professionals
// @route   GET /api/appointments/health-professionals
// @access  Private (Adult, Adolescent)
const getHealthProfessionals = async (req, res) => {
	try {
		const healthProfessionals = await User.find({
			userType: "health_prof",
			isActive: true,
		}).select("name email createdAt");

		res.status(200).json({
			success: true,
			message: "Health professionals retrieved successfully",
			data: { healthProfessionals },
		});
	} catch (error) {
		console.error("Get health professionals error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while retrieving health professionals",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Cancel appointment (by patient only)
// @route   DELETE /api/appointments/:id
// @access  Private (Adult, Adolescent)
const cancelAppointment = async (req, res) => {
	try {
		const appointment = await Appointment.findOne({
			_id: req.params.id,
			patient: req.user.id,
		});

		if (!appointment) {
			return res.status(404).json({
				success: false,
				message: "Appointment not found or you are not authorized to cancel it",
			});
		}

		if (appointment.status === "completed") {
			return res.status(400).json({
				success: false,
				message: "Cannot cancel completed appointments",
			});
		}

		appointment.status = "cancelled";
		await appointment.save();

		res.status(200).json({
			success: true,
			message: "Appointment cancelled successfully",
		});
	} catch (error) {
		console.error("Cancel appointment error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while cancelling appointment",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

module.exports = {
	createAppointment,
	getAppointments,
	updateAppointmentStatus,
	getHealthProfessionals,
	cancelAppointment,
};
