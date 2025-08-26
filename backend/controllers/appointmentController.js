import Appointment from "../models/Appointment.js";
import User from "../models/User.js";

// Create new appointment
export const createAppointment = async (req, res) => {
	try {
		const { healthProfessionalId, appointmentDate, appointmentTime, description, isUrgent } = req.body;

		const healthProfessional = await User.findOne({ _id: healthProfessionalId, userType: "health_prof", isActive: true });
		if (!healthProfessional) {
			return res.status(404).json({ success: false, message: "Health professional not found" });
		}

		const appointment = await Appointment.create({
			patient: req.user.id,
			healthProfessional: healthProfessionalId,
			appointmentDate,
			appointmentTime,
			description,
			isUrgent: !!isUrgent,
		});

		res.status(201).json({ success: true, data: appointment });
	} catch (error) {
		res.status(500).json({ success: false, message: "Something went wrong" });
	}
};

// Get all appointments (patient sees their own, doctors see their own)
export const getAppointments = async (req, res) => {
	try {
		let query = req.user.userType === "health_prof" ? { healthProfessional: req.user.id } : { patient: req.user.id };

		const appointments = await Appointment.find(query).populate("patient", "name email").populate("healthProfessional", "name email").sort({ createdAt: -1 });

		res.json({ success: true, data: appointments });
	} catch (error) {
		res.status(500).json({ success: false, message: "Something went wrong" });
	}
};

// Update status (accept / reject / complete)
export const updateAppointmentStatus = async (req, res) => {
	try {
		const { status, rejectionReason, notes, meetingLink } = req.body;
		const appointment = await Appointment.findOne({ _id: req.params.id, healthProfessional: req.user.id });

		if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

		appointment.status = status || appointment.status;
		if (rejectionReason) appointment.rejectionReason = rejectionReason;
		if (notes) appointment.notes = notes;
		if (meetingLink) appointment.meetingLink = meetingLink;

		await appointment.save();
		res.json({ success: true, data: appointment });
	} catch (error) {
		res.status(500).json({ success: false, message: "Something went wrong" });
	}
};

// Get list of health professionals
export const getHealthProfessionals = async (req, res) => {
	try {
		const healthProfessionals = await User.find({ userType: "health_prof", isActive: true }).select("name email");
		res.json({ success: true, data: healthProfessionals });
	} catch (error) {
		res.status(500).json({ success: false, message: "Something went wrong" });
	}
};

// Cancel appointment
export const cancelAppointment = async (req, res) => {
	try {
		const appointment = await Appointment.findOne({ _id: req.params.id, patient: req.user.id });
		if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

		appointment.status = "cancelled";
		await appointment.save();

		res.json({ success: true, message: "Appointment cancelled" });
	} catch (error) {
		res.status(500).json({ success: false, message: "Something went wrong" });
	}
};
