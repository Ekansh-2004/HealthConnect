const express = require("express");
const { body, validationResult, query } = require("express-validator");
const { protect, authorize } = require("../middleware/auth");
const { createStory, getStories, getStoryById, toggleLikeStory, addComment, getMyStories } = require("../controllers/storyController");

const router = express.Router();

// @route   POST /api/stories
// @desc    Create a new story/advice post
// @access  Private
router.post("/", protect, [body("title").trim().isLength({ min: 5, max: 100 }).withMessage("Title must be between 5 and 100 characters"), body("content").trim().isLength({ min: 50, max: 5000 }).withMessage("Content must be between 50 and 5000 characters"), body("category").isIn(["personal_story", "advice", "educational", "support", "awareness"]).withMessage("Category must be personal_story, advice, educational, support, or awareness"), body("tags").optional().isArray({ max: 10 }).withMessage("Tags must be an array with maximum 10 items"), body("tags.*").optional().trim().isLength({ min: 1, max: 20 }).withMessage("Each tag must be between 1 and 20 characters"), body("isAnonymous").optional().isBoolean().withMessage("isAnonymous must be a boolean value")], createStory);

// @route   GET /api/stories
// @desc    Get stories with filtering and pagination
// @access  Public
router.get("/", [query("category").optional().isIn(["personal_story", "advice", "educational", "support", "awareness"]).withMessage("Invalid category filter"), query("tags").optional().isString().withMessage("Tags must be a comma-separated string"), query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"), query("limit").optional().isInt({ min: 1, max: 20 }).withMessage("Limit must be between 1 and 20"), query("sortBy").optional().isIn(["newest", "oldest", "popular", "most_liked"]).withMessage("SortBy must be newest, oldest, popular, or most_liked")], getStories);

// @route   GET /api/stories/:id
// @desc    Get single story with comments
// @access  Public
router.get("/:id", getStoryById);

// @route   POST /api/stories/:id/like
// @desc    Like/unlike a story
// @access  Private
router.post("/:id/like", protect, toggleLikeStory);

// @route   POST /api/stories/:id/comments
// @desc    Add a comment to a story
// @access  Private
router.post("/:id/comments", protect, [body("content").trim().isLength({ min: 1, max: 500 }).withMessage("Comment must be between 1 and 500 characters"), body("isAnonymous").optional().isBoolean().withMessage("isAnonymous must be a boolean value")], addComment);

// @route   GET /api/stories/my/posts
// @desc    Get current user's stories
// @access  Private
router.get("/my/posts", protect, [query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"), query("limit").optional().isInt({ min: 1, max: 20 }).withMessage("Limit must be between 1 and 20")], getMyStories);

module.exports = router;
