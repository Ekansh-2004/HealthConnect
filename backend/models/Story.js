const mongoose = require("mongoose");

const storySchema = new mongoose.Schema(
	{
		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Author is required"],
		},
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxLength: [100, "Title cannot exceed 100 characters"],
			minLength: [5, "Title must be at least 5 characters long"],
		},
		content: {
			type: String,
			required: [true, "Content is required"],
			trim: true,
			maxLength: [5000, "Content cannot exceed 5000 characters"],
			minLength: [50, "Content must be at least 50 characters long"],
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			enum: {
				values: ["personal_story", "advice", "educational", "support", "awareness"],
				message: "Category must be personal_story, advice, educational, support, or awareness",
			},
		},
		tags: [
			{
				type: String,
				trim: true,
				lowercase: true,
				maxLength: [20, "Each tag cannot exceed 20 characters"],
			},
		],
		isAnonymous: {
			type: Boolean,
			default: false,
		},
		isApproved: {
			type: Boolean,
			default: false,
		},
		approvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		approvedAt: {
			type: Date,
		},
		likes: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				likedAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		comments: [
			{
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
					required: true,
				},
				content: {
					type: String,
					required: true,
					trim: true,
					maxLength: [500, "Comment cannot exceed 500 characters"],
				},
				isAnonymous: {
					type: Boolean,
					default: false,
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		viewCount: {
			type: Number,
			default: 0,
		},
		reportCount: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
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
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ category: 1, isApproved: 1, isActive: 1 });
storySchema.index({ tags: 1 });
storySchema.index({ createdAt: -1, isApproved: 1 });

// Virtual for like count
storySchema.virtual("likeCount").get(function () {
	return this.likes.length;
});

// Virtual for comment count
storySchema.virtual("commentCount").get(function () {
	return this.comments.length;
});

// Method to add a like
storySchema.methods.addLike = function (userId) {
	const existingLike = this.likes.find((like) => like.user.toString() === userId.toString());
	if (!existingLike) {
		this.likes.push({ user: userId });
		return this.save();
	}
	return Promise.resolve(this);
};

// Method to remove a like
storySchema.methods.removeLike = function (userId) {
	this.likes = this.likes.filter((like) => like.user.toString() !== userId.toString());
	return this.save();
};

// Method to add a comment
storySchema.methods.addComment = function (userId, content, isAnonymous = false) {
	this.comments.push({
		user: userId,
		content,
		isAnonymous,
	});
	return this.save();
};

// Method to increment view count
storySchema.methods.incrementViewCount = function () {
	this.viewCount += 1;
	return this.save();
};

module.exports = mongoose.model("Story", storySchema);
