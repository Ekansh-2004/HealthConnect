const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const { createAppointment, getAppointments, updateAppointmentStatus, getHealthProfessionals, cancelAppointment } = require("../controllers/appointmentController");

const router = express.Router();

// Create appointment (Adults & Adolescents)
router.post("/", protect, authorize("adult", "adolescent"), createAppointment);

// Get appointments (by user role)
router.get("/", protect, getAppointments);

// Update status (Health professional only)
router.put("/:id/status", protect, authorize("health_prof"), updateAppointmentStatus);

// Get health professionals
router.get("/health-professionals", protect, authorize("adult", "adolescent"), getHealthProfessionals);

// Cancel appointment (Patients only)
router.delete("/:id", protect, authorize("adult", "adolescent"), cancelAppointment);

module.exports = router;
