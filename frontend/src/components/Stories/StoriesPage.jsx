import { CheckCircle, Clock, Heart, MessageSquare, Plus, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useStoryStore } from "../../store/useStoryStore.jsx";
import { useUserStore } from "../../store/useUserStore.jsx";

const StoriesPage = () => {
	const { user } = useUserStore();
	const { stories, loading, error, submitting, fetchStories, createStory, toggleLike, addComment, clearError, setCurrentUser } = useStoryStore();

	const [showSubmissionForm, setShowSubmissionForm] = useState(false);
	const [storyContent, setStoryContent] = useState("");
	const [storyTitle, setStoryTitle] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("personal_story");
	const [submitted, setSubmitted] = useState(false);
	const [submittingStory, setSubmittingStory] = useState(false);

	const [commentInputs, setCommentInputs] = useState({});
	const [openComments, setOpenComments] = useState({});
	const [translatingStories, setTranslatingStories] = useState({});
	const [translatedContent, setTranslatedContent] = useState({});

	const categories = [
		{ value: "personal_story", label: "Personal Story" },
		{ value: "advice", label: "Advice" },
		{ value: "educational", label: "Educational" },
		{ value: "support", label: "Support" },
		{ value: "awareness", label: "Awareness" },
	];

	useEffect(() => {
		if (user?._id) setCurrentUser(user._id);
		fetchStories();
	}, [user?._id, fetchStories, setCurrentUser]);

	useEffect(() => {
		return () => clearError();
	}, [clearError]);

	const translateWithGemini = async (text) => {
		const apiKey = "AIzaSyAeRhjpSmZgw3UttKNd3vwowbEwNA8VShI";
		const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

		const prompt = `
      Translate the following text from English to Hindi.
      Keep meaning accurate, no extra explanation.
      Text: """${text}"""
    `;

		const payload = { contents: [{ parts: [{ text: prompt }] }] };

		try {
			const res = await fetch(apiUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
		} catch (err) {
			console.error("Gemini Translation Error:", err);
			alert("Translation failed. Please try again.");
			return text;
		}
	};

	// Handle Translate button
	const handleTranslate = async (storyId, text) => {
		setTranslatingStories((prev) => ({ ...prev, [storyId]: true }));
		const translated = await translateWithGemini(text);
		setTranslatedContent((prev) => ({ ...prev, [storyId]: translated }));
		setTranslatingStories((prev) => ({ ...prev, [storyId]: false }));
	};

	// Restore English
	const handleBackToEnglish = (storyId) => {
		setTranslatedContent((prev) => ({ ...prev, [storyId]: null }));
	};

	// Submit Story
	// Submit Story
	const handleSubmitStory = async () => {
		if (!storyTitle.trim() || !storyContent.trim()) return;

		try {
			setSubmittingStory(true);
			setSubmitted(false);

			const newStory = await createStory({
				title: storyTitle,
				content: storyContent,
				category: selectedCategory,
			});

			// ✅ Force re-fetch so UI shows correct date & author
			await fetchStories();

			// Reset form
			setStoryTitle("");
			setStoryContent("");
			setSelectedCategory("personal_story");

			setSubmitted(true);

			// Close form after 3 seconds
			setTimeout(() => {
				setSubmitted(false);
				setShowSubmissionForm(false);
			}, 3000);
		} catch (err) {
			console.error("Failed to submit story:", err.message);
			alert("Failed to submit story. Please try again.");
		} finally {
			setSubmittingStory(false);
		}
	};

	const handleLike = async (storyId) => {
		try {
			await toggleLike(storyId);
		} catch (err) {
			console.error("Failed to toggle like:", err.message);
		}
	};

	const handleComment = async (storyId) => {
		const commentText = commentInputs[storyId]?.trim();
		if (!commentText) return;

		try {
			await addComment(storyId, commentText);
			setCommentInputs((prev) => ({ ...prev, [storyId]: "" }));
		} catch (err) {
			console.error("Failed to add comment:", err.message);
		}
	};

	const toggleComments = (storyId) => setOpenComments((prev) => ({ ...prev, [storyId]: !prev[storyId] }));

	const isStoryLiked = (story) => {
		if (!user?._id || !story.likes) return false;
		return story.likes.some((like) => {
			const likeUserId = typeof like.user === "object" ? like.user._id : like.user;
			return likeUserId === user._id;
		});
	};

	const getLikeCount = (story) => story.likes?.length || 0;
	const getCommentCount = (story) => story.comments?.length || 0;

	if (loading && stories.length === 0)
		return (
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-center items-center py-12 text-gray-600">Loading stories...</div>
			</div>
		);

	return (
		<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			{/* Header */}
			<div className="flex justify-between items-center mb-8">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Community Stories</h1>
					<p className="mt-2 text-gray-600">Share your experiences and learn from others in our supportive community</p>
				</div>
				{!showSubmissionForm && (
					<button
						onClick={() => setShowSubmissionForm(true)}
						className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
					>
						<Plus className="h-4 w-4 mr-2" /> Share Story
					</button>
				)}
			</div>

			{/* Error Display */}
			{error && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
					{error}
					<button
						onClick={clearError}
						className="ml-2 text-red-800 underline"
					>
						Dismiss
					</button>
				</div>
			)}

			{/* Submission Form */}
			{showSubmissionForm && (
				<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Story</h2>
					{submitted ? (
						<div className="text-center py-8">
							<CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for sharing!</h3>
							<p className="text-gray-600">Your story has been published successfully</p>
						</div>
					) : (
						<>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
								<input
									type="text"
									value={storyTitle}
									onChange={(e) => setStoryTitle(e.target.value)}
									placeholder="Give your story a title..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									maxLength={100}
								/>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
								<select
									value={selectedCategory}
									onChange={(e) => setSelectedCategory(e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									{categories.map((category) => (
										<option
											key={category.value}
											value={category.value}
										>
											{category.label}
										</option>
									))}
								</select>
							</div>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-700 mb-2">Your Story</label>
								<textarea
									value={storyContent}
									onChange={(e) => setStoryContent(e.target.value)}
									placeholder="Share your experience, insights, or advice..."
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									rows={6}
									maxLength={5000}
								/>
								<div className="text-right text-sm text-gray-500 mt-1">{storyContent.length}/5000 characters</div>
							</div>

							<div className="flex space-x-3">
								<button
									onClick={handleSubmitStory}
									disabled={!storyContent.trim() || !storyTitle.trim() || submittingStory}
									className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
								>
									{submittingStory ? "Submitting..." : "Submit Story"}
								</button>
								<button
									onClick={() => setShowSubmissionForm(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
								>
									Cancel
								</button>
							</div>
						</>
					)}
				</div>
			)}

			{/* Stories Feed */}
			{stories.length === 0 ? (
				<div className="text-center py-12">
					<div className="text-gray-500">No stories available yet. Be the first to share!</div>
				</div>
			) : (
				<div className="space-y-6">
					{stories.map((story) => {
						const isCommentsOpen = openComments[story._id];
						const likeCount = getLikeCount(story);
						const commentCount = getCommentCount(story);
						const isLiked = isStoryLiked(story);
						const isTranslating = translatingStories[story._id];
						const displayedText = translatedContent[story._id] || story.content;

						return (
							<div
								key={story._id}
								className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
							>
								{/* Story Header */}
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-3">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{story.category?.replace("_", " ")}</span>
										<span className="text-sm text-gray-600">by {story.author?.name || "Anonymous"}</span>
									</div>
									<div className="flex items-center text-sm text-gray-500">
										<Clock className="h-4 w-4 mr-1" />
										<span>{story.createdAt ? new Date(story.createdAt).toLocaleDateString() : ""}</span>
									</div>
								</div>

								<h3 className="text-lg font-semibold text-gray-900 mb-2">{story.title}</h3>
								<div className="prose max-w-none mb-6">
									<p className="text-gray-700 whitespace-pre-line">{displayedText}</p>
								</div>

								{/* Translate / Back Button */}
								<div className="mb-4">
									{!translatedContent[story._id] ? (
										<button
											onClick={() => handleTranslate(story._id, story.content)}
											className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
											disabled={isTranslating}
										>
											{isTranslating ? "Translating..." : "Translate to Hindi"}
										</button>
									) : (
										<button
											onClick={() => handleBackToEnglish(story._id)}
											className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
										>
											Back to English
										</button>
									)}
								</div>

								{/* Comments Section */}
								{isCommentsOpen && (
									<div className="mb-4">
										<div className="font-semibold text-gray-700 mb-2">Comments:</div>
										<div className="space-y-2 mb-4">
											{story.comments?.map((comment) => (
												<div
													key={comment._id}
													className="bg-gray-50 text-gray-900 px-3 py-2 rounded"
												>
													<div className="text-sm text-gray-600 mb-1">
														{comment.user?.name || "Anonymous"} • {new Date(comment.createdAt).toLocaleDateString()}
													</div>
													<div>{comment.content}</div>
												</div>
											))}
										</div>
										<div className="flex items-center space-x-2">
											<input
												type="text"
												value={commentInputs[story._id] || ""}
												onChange={(e) =>
													setCommentInputs((prev) => ({
														...prev,
														[story._id]: e.target.value,
													}))
												}
												placeholder="Add a comment..."
												className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												maxLength={500}
											/>
											<button
												onClick={() => handleComment(story._id)}
												className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
												disabled={!commentInputs[story._id]?.trim()}
											>
												Post
											</button>
										</div>
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex items-center justify-between pt-4 border-t border-gray-200">
									<div className="flex items-center space-x-4">
										<button
											className={`flex items-center space-x-2 transition-colors ${isLiked ? "text-red-600" : "text-gray-600 hover:text-red-600"}`}
											onClick={() => handleLike(story._id)}
										>
											<Heart
												className="h-4 w-4"
												fill={isLiked ? "red" : "none"}
												stroke={isLiked ? "red" : "currentColor"}
											/>
											<span className="text-sm">{likeCount}</span>
										</button>
										<button
											className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
											onClick={() => toggleComments(story._id)}
										>
											<MessageSquare className="h-4 w-4" />
											<span className="text-sm">{commentCount}</span>
										</button>
										<button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
											<Share2 className="h-4 w-4" />
											<span className="text-sm">Share</span>
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default StoriesPage;
