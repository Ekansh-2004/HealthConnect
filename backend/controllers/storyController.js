const Story = require("../models/Story");

// Create Story
const createStory = async (req, res) => {
	try {
		const { title, content, category, tags, isAnonymous } = req.body;

		const story = await Story.create({
			author: req.user.id,
			title,
			content,
			category,
			tags: tags || [],
			isAnonymous: isAnonymous || false,
			isApproved: req.user.userType === "health_prof",
			approvedBy: req.user.userType === "health_prof" ? req.user.id : undefined,
			approvedAt: req.user.userType === "health_prof" ? new Date() : undefined,
		});

		await story.populate("author", "name userType");
		res.status(201).json({ success: true, data: story });
	} catch (err) {
		res.status(500).json({ success: false, message: "Could not create story" });
	}
};

// Get Stories
const getStories = async (req, res) => {
	try {
		const { category, tags, page = 1, limit = 10, sortBy = "newest" } = req.query;
		const skip = (page - 1) * limit;

		let query = { isApproved: true, isActive: true };
		if (category) query.category = category;
		if (tags) query.tags = { $in: tags.split(",").map((t) => t.trim().toLowerCase()) };

		let sortOptions = { createdAt: -1 };
		if (sortBy === "oldest") sortOptions = { createdAt: 1 };
		if (sortBy === "popular") sortOptions = { viewCount: -1, createdAt: -1 };
		if (sortBy === "most_liked") sortOptions = { "likes.length": -1, createdAt: -1 };

		const stories = await Story.find(query).populate("author", "name userType").populate("approvedBy", "name").sort(sortOptions).skip(skip).limit(parseInt(limit)).select("-comments");

		const total = await Story.countDocuments(query);

		const result = stories.map((s) => {
			const obj = s.toObject();
			if (s.isAnonymous) obj.author = { name: "Anonymous", userType: s.author.userType };
			return obj;
		});

		res.json({
			success: true,
			data: {
				stories: result,
				pagination: {
					currentPage: Number(page),
					totalPages: Math.ceil(total / limit),
					totalStories: total,
				},
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, message: "Could not fetch stories" });
	}
};

// Get Single Story
const getStoryById = async (req, res) => {
	try {
		const story = await Story.findOne({ _id: req.params.id, isApproved: true, isActive: true }).populate("author", "name userType").populate("comments.user", "name userType").populate("approvedBy", "name");

		if (!story) return res.status(404).json({ success: false, message: "Story not found" });

		await story.incrementViewCount();

		const obj = story.toObject();
		if (story.isAnonymous) obj.author = { name: "Anonymous", userType: story.author.userType };
		obj.comments = obj.comments.map((c) => (c.isAnonymous ? { ...c, user: { name: "Anonymous", userType: c.user.userType } } : c));

		res.json({ success: true, data: obj });
	} catch (err) {
		res.status(500).json({ success: false, message: "Could not fetch story" });
	}
};

// Like / Unlike Story
const toggleLikeStory = async (req, res) => {
	try {
		const story = await Story.findOne({ _id: req.params.id, isApproved: true, isActive: true });
		if (!story) return res.status(404).json({ success: false, message: "Story not found" });

		const liked = story.likes.some((like) => like.user.toString() === req.user.id);

		if (liked) {
			await story.removeLike(req.user.id);
			return res.json({ success: true, data: { liked: false, likeCount: story.likes.length } });
		} else {
			await story.addLike(req.user.id);
			return res.json({ success: true, data: { liked: true, likeCount: story.likes.length } });
		}
	} catch (err) {
		res.status(500).json({ success: false, message: "Could not toggle like" });
	}
};

// Add Comment
const addComment = async (req, res) => {
	try {
		const { content, isAnonymous } = req.body;

		const story = await Story.findOne({ _id: req.params.id, isApproved: true, isActive: true });
		if (!story) return res.status(404).json({ success: false, message: "Story not found" });

		await story.addComment(req.user.id, content, isAnonymous || false);

		const updated = await Story.findById(req.params.id).populate("comments.user", "name userType");
		const newComment = updated.comments[updated.comments.length - 1];

		const obj = newComment.toObject();
		if (newComment.isAnonymous) obj.user = { name: "Anonymous", userType: newComment.user.userType };

		res.status(201).json({ success: true, data: obj });
	} catch (err) {
		res.status(500).json({ success: false, message: "Could not add comment" });
	}
};

// Get My Stories
const getMyStories = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const skip = (page - 1) * limit;

		const stories = await Story.find({ author: req.user.id, isActive: true }).populate("approvedBy", "name").sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).select("-comments");

		const total = await Story.countDocuments({ author: req.user.id, isActive: true });

		res.json({
			success: true,
			data: {
				stories,
				pagination: {
					currentPage: Number(page),
					totalPages: Math.ceil(total / limit),
					totalStories: total,
				},
			},
		});
	} catch (err) {
		res.status(500).json({ success: false, message: "Could not fetch your stories" });
	}
};

module.exports = { createStory, getStories, getStoryById, toggleLikeStory, addComment, getMyStories };
