const express = require("express");
const { body, validationResult, query } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const { createAppointment, getAppointments, updateAppointmentStatus, getHealthProfessionals, cancelAppointment } = require("../controllers/appointmentController");

const router = express.Router();

// @route   POST /api/appointments
// @desc    Create a new appointment request
// @access  Private (Adult, Adolescent)
router.post(
	"/",
	protect,
	authorize("adult", "adolescent"),
	[
		body("healthProfessionalId").isMongoId().withMessage("Please provide a valid health professional ID"),

		body("appointmentDate")
			.isISO8601()
			.withMessage("Please provide a valid date in ISO format")
			.custom((value) => {
				const appointmentDate = new Date(value);
				const today = new Date();
				today.setHours(0, 0, 0, 0);

				if (appointmentDate <= today) {
					throw new Error("Appointment date must be in the future");
				}
				return true;
			}),

		body("appointmentTime")
			.matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
			.withMessage("Please provide time in HH:MM format"),

		body("description").trim().isLength({ min: 10, max: 500 }).withMessage("Description must be between 10 and 500 characters"),

		body("isUrgent").optional().isBoolean().withMessage("isUrgent must be a boolean value"),
	],
	createAppointment
);

// @route   GET /api/appointments
// @desc    Get appointments (filtered by user role)
// @access  Private
router.get("/", protect, [query("status").optional().isIn(["pending", "accepted", "rejected", "completed", "cancelled"]).withMessage("Invalid status filter"), query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"), query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50")], getAppointments);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status (accept/reject by health professional)
// @access  Private (Health Professional only)
router.put("/:id/status", protect, authorize("health_prof"), [body("status").isIn(["accepted", "rejected", "completed"]).withMessage("Status must be accepted, rejected, or completed"), body("rejectionReason").optional().trim().isLength({ max: 200 }).withMessage("Rejection reason cannot exceed 200 characters"), body("notes").optional().trim().isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"), body("meetingLink").optional().trim().isURL().withMessage("Please provide a valid meeting link")], updateAppointmentStatus);

// @route   GET /api/appointments/health-professionals
// @desc    Get list of available health professionals
// @access  Private (Adult, Adolescent)
router.get("/health-professionals", protect, authorize("adult", "adolescent"), getHealthProfessionals);

// @route   DELETE /api/appointments/:id
// @desc    Cancel appointment (by patient only)
// @access  Private (Adult, Adolescent)
router.delete("/:id", protect, authorize("adult", "adolescent"), cancelAppointment);

module.exports = router;
