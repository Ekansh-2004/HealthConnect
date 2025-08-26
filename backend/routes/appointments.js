import express from "express";
import { cancelAppointment, createAppointment, getAppointments, getHealthProfessionals, updateAppointmentStatus } from "../controllers/appointmentController.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Create appointment (Adults & Adolescents)
router.post("/", protectRoute, createAppointment);

// Get appointments (by user role)
router.get("/", protectRoute, getAppointments);

// Update status (Health professional only)
router.put("/:id/status", protectRoute, updateAppointmentStatus);

// Get health professionals
router.get("/health-professionals", protectRoute, getHealthProfessionals);

// Cancel appointment (Patients only)
router.delete("/:id", protectRoute, cancelAppointment);

export default router;
