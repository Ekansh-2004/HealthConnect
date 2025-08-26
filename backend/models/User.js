const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			maxLength: [50, "Name cannot exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minLength: [6, "Password must be at least 6 characters long"],
			select: false, // Don't include password in queries by default
		},
		userType: {
			type: String,
			required: [true, "User type is required"],
			enum: {
				values: ["adult", "adolescent", "health_prof"],
				message: "User type must be either adult, adolescent, or health_prof",
			},
		},
		isEmailVerified: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLogin: {
			type: Date,
			default: null,
		},
		loginAttempts: {
			type: Number,
			default: 0,
		},
		lockUntil: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: function (doc, ret) {
				delete ret.password;
				delete ret.__v;
				return ret;
			},
		},
	}
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });

// Virtual for account locked status
userSchema.virtual("isLocked").get(function () {
	return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
	// Only hash the password if it has been modified (or is new)
	if (!this.isModified("password")) return next();

	try {
		// Hash password with cost of 12
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
	if (!this.password) return false;
	return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
	// If we have a previous lock that has expired, restart at 1
	if (this.lockUntil && this.lockUntil < Date.now()) {
		return this.updateOne({
			$unset: { lockUntil: 1 },
			$set: { loginAttempts: 1 },
		});
	}

	const updates = { $inc: { loginAttempts: 1 } };

	// Lock account after 5 attempts for 2 hours
	if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
		updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
	}

	return this.updateOne(updates);
};

// Static method to get account lock reasons
userSchema.statics.failedLogin = {
	NOT_FOUND: 0,
	PASSWORD_INCORRECT: 1,
	MAX_ATTEMPTS: 2,
};

module.exports = mongoose.model("User", userSchema);
