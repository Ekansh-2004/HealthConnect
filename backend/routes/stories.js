const express = require("express");
const { protect } = require("../middleware/auth");
const { createStory, getStories, getStoryById, toggleLikeStory, addComment, getMyStories } = require("../controllers/storyController");

const router = express.Router();

// Stories
router.post("/", protect, createStory);
router.get("/", getStories);
router.get("/:id", getStoryById);
router.post("/:id/like", protect, toggleLikeStory);
router.post("/:id/comments", protect, addComment);
router.get("/my/posts", protect, getMyStories);

module.exports = router;
