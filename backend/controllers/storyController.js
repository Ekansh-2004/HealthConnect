const { validationResult } = require("express-validator");
const Story = require("../models/Story");

// @desc    Create a new story/advice post
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { title, content, category, tags, isAnonymous } = req.body;

		// Create story
		const story = await Story.create({
			author: req.user.id,
			title,
			content,
			category,
			tags: tags || [],
			isAnonymous: isAnonymous || false,
			// Auto-approve stories from health professionals
			isApproved: req.user.userType === "health_prof",
			approvedBy: req.user.userType === "health_prof" ? req.user.id : undefined,
			approvedAt: req.user.userType === "health_prof" ? new Date() : undefined,
		});

		// Populate author details
		await story.populate("author", "name userType");

		res.status(201).json({
			success: true,
			message: "Story created successfully",
			data: { story },
		});
	} catch (error) {
		console.error("Create story error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while creating story",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Get stories with filtering and pagination
// @route   GET /api/stories
// @access  Public
const getStories = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { category, tags, page = 1, limit = 10, sortBy = "newest" } = req.query;
		const skip = (page - 1) * limit;

		// Build query
		let query = { isApproved: true, isActive: true };

		if (category) {
			query.category = category;
		}

		if (tags) {
			const tagArray = tags.split(",").map((tag) => tag.trim().toLowerCase());
			query.tags = { $in: tagArray };
		}

		// Build sort options
		let sortOptions = {};
		switch (sortBy) {
			case "oldest":
				sortOptions = { createdAt: 1 };
				break;
			case "popular":
				sortOptions = { viewCount: -1, createdAt: -1 };
				break;
			case "most_liked":
				sortOptions = { "likes.length": -1, createdAt: -1 };
				break;
			default: // newest
				sortOptions = { createdAt: -1 };
		}

		// Get stories with pagination
		const stories = await Story.find(query).populate("author", "name userType").populate("approvedBy", "name").sort(sortOptions).skip(skip).limit(parseInt(limit)).select("-comments"); // Exclude comments for list view

		const total = await Story.countDocuments(query);

		// Transform stories to hide author info for anonymous posts
		const transformedStories = stories.map((story) => {
			const storyObj = story.toObject();
			if (story.isAnonymous) {
				storyObj.author = { name: "Anonymous", userType: story.author.userType };
			}
			return storyObj;
		});

		res.status(200).json({
			success: true,
			message: "Stories retrieved successfully",
			data: {
				stories: transformedStories,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(total / limit),
					totalStories: total,
					hasNextPage: page * limit < total,
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		console.error("Get stories error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while retrieving stories",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Get single story with comments
// @route   GET /api/stories/:id
// @access  Public
const getStoryById = async (req, res) => {
	try {
		const story = await Story.findOne({
			_id: req.params.id,
			isApproved: true,
			isActive: true,
		})
			.populate("author", "name userType")
			.populate("comments.user", "name userType")
			.populate("approvedBy", "name");

		if (!story) {
			return res.status(404).json({
				success: false,
				message: "Story not found",
			});
		}

		// Increment view count
		await story.incrementViewCount();

		// Transform story to hide author info for anonymous posts
		const storyObj = story.toObject();
		if (story.isAnonymous) {
			storyObj.author = { name: "Anonymous", userType: story.author.userType };
		}

		// Transform comments to hide user info for anonymous comments
		storyObj.comments = storyObj.comments.map((comment) => {
			if (comment.isAnonymous) {
				comment.user = { name: "Anonymous", userType: comment.user.userType };
			}
			return comment;
		});

		res.status(200).json({
			success: true,
			message: "Story retrieved successfully",
			data: { story: storyObj },
		});
	} catch (error) {
		console.error("Get story error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while retrieving story",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Like/unlike a story
// @route   POST /api/stories/:id/like
// @access  Private
const toggleLikeStory = async (req, res) => {
	try {
		const story = await Story.findOne({
			_id: req.params.id,
			isApproved: true,
			isActive: true,
		});

		if (!story) {
			return res.status(404).json({
				success: false,
				message: "Story not found",
			});
		}

		const existingLike = story.likes.find((like) => like.user.toString() === req.user.id);

		if (existingLike) {
			// Unlike the story
			await story.removeLike(req.user.id);
			res.status(200).json({
				success: true,
				message: "Story unliked successfully",
				data: { liked: false, likeCount: story.likes.length },
			});
		} else {
			// Like the story
			await story.addLike(req.user.id);
			res.status(200).json({
				success: true,
				message: "Story liked successfully",
				data: { liked: true, likeCount: story.likes.length },
			});
		}
	} catch (error) {
		console.error("Like story error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while liking story",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Add a comment to a story
// @route   POST /api/stories/:id/comments
// @access  Private
const addComment = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { content, isAnonymous } = req.body;

		const story = await Story.findOne({
			_id: req.params.id,
			isApproved: true,
			isActive: true,
		});

		if (!story) {
			return res.status(404).json({
				success: false,
				message: "Story not found",
			});
		}

		await story.addComment(req.user.id, content, isAnonymous || false);

		// Get the newly added comment with user details
		const updatedStory = await Story.findById(req.params.id).populate("comments.user", "name userType");

		const newComment = updatedStory.comments[updatedStory.comments.length - 1];

		// Transform comment to hide user info if anonymous
		const commentObj = newComment.toObject();
		if (newComment.isAnonymous) {
			commentObj.user = { name: "Anonymous", userType: newComment.user.userType };
		}

		res.status(201).json({
			success: true,
			message: "Comment added successfully",
			data: { comment: commentObj },
		});
	} catch (error) {
		console.error("Add comment error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while adding comment",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

// @desc    Get current user's stories
// @route   GET /api/stories/my/posts
// @access  Private
const getMyStories = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({
				success: false,
				message: "Validation failed",
				errors: errors.array(),
			});
		}

		const { page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		const stories = await Story.find({
			author: req.user.id,
			isActive: true,
		})
			.populate("approvedBy", "name")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.select("-comments");

		const total = await Story.countDocuments({
			author: req.user.id,
			isActive: true,
		});

		res.status(200).json({
			success: true,
			message: "Your stories retrieved successfully",
			data: {
				stories,
				pagination: {
					currentPage: parseInt(page),
					totalPages: Math.ceil(total / limit),
					totalStories: total,
					hasNextPage: page * limit < total,
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		console.error("Get user stories error:", error);
		res.status(500).json({
			success: false,
			message: "Server error while retrieving your stories",
			error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
		});
	}
};

module.exports = {
	createStory,
	getStories,
	getStoryById,
	toggleLikeStory,
	addComment,
	getMyStories,
};
