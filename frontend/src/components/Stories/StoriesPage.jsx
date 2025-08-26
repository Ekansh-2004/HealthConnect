import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, MessageSquare, Share2, Plus, Clock, CheckCircle } from 'lucide-react';
import { addStory } from '../../store/slices/contentSlice';

const StoriesPage = () => {
  // const { t } = useTranslation();
  const dispatch = useDispatch();
  const { stories } = useSelector((state) => state.content);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [storyContent, setStoryContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);

  // Initial comments for each story (dynamic, can be empty or have some comments)
  const initialCommentsData = {
    '1': [
      "This is so relatable!",
      "Thanks for sharing your experience.",
      "Very informative.",
      "I had a similar experience.",
      "Appreciate your honesty.",
      "Great advice!",
      "This helped me a lot."
    ],
    '2': [
      "Community support is so important.",
      "Thanks for opening up!",
      "I agree with you.",
      "This resonates with me.",
      "Keep sharing!",
      "You are not alone.",
      "Such a positive story.",
      "Inspired by your journey.",
      "Love this!",
      "Thanks for posting.",
      "Very encouraging.",
      "Wonderful!"
    ],
    '3': [
      "Healthcare access is crucial.",
      "Glad you shared this.",
      "Hope things are better now.",
      "Thanks for your story."
    ]
  };

  const initialStories = [
    {
      id: '1',
      content: `I was 16 when I first learned about proper contraception...`,
      approved: true,
      createdAt: '2024-01-15',
      category: 'Education',
      reactions: { likes: 23 }
    },
    {
      id: '2',
      content: `As a college student, I discovered that many of my friends...`,
      approved: true,
      createdAt: '2024-01-10',
      category: 'Community',
      reactions: { likes: 31 }
    },
    {
      id: '3',
      content: `I want to share my experience visiting a healthcare provider...`,
      approved: true,
      createdAt: '2024-01-08',
      category: 'Healthcare',
      reactions: { likes: 18 }
    }
  ];
  const [storiesList, setStoriesList] = useState(initialStories);

  // Store initial comments for each story
  const [initialComments] = useState(initialCommentsData);

  const categories = [
    { value: 'general', label: 'General Experience' },
    { value: 'education', label: 'Education & Learning' },
    { value: 'healthcare', label: 'Healthcare Experience' },
    { value: 'community', label: 'Community & Support' },
    { value: 'relationships', label: 'Relationships' }
  ];

  // Update like/comment state initializations to use storiesList
  const [likedStories, setLikedStories] = useState({});
  const [likeCounts, setLikeCounts] = useState(() => {
    const counts = {};
    initialStories.forEach(story => {
      counts[story.id] = story.reactions.likes;
    });
    return counts;
  });

  // Update userComments to include new stories dynamically
  const [userComments, setUserComments] = useState(() => {
    const obj = {};
    initialStories.forEach(story => {
      obj[story.id] = [];
    });
    return obj;
  });
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({}); // Track which story's comments are open

  // Comment button handler
  const handleComment = (storyId) => {
    const commentText = commentInputs[storyId]?.trim();
    if (!commentText) return;
    setUserComments(prev => ({
      ...prev,
      [storyId]: [...prev[storyId], commentText]
    }));
    setCommentInputs(prev => ({
      ...prev,
      [storyId]: ''
    }));
  };

  // Remove comment handler (only for user comments)
  const handleRemoveComment = (storyId, idx) => {
    setUserComments(prev => {
      const updated = [...prev[storyId]];
      updated.splice(idx, 1);
      return {
        ...prev,
        [storyId]: updated
      };
    });
  };

  const handleSubmitStory = async () => {
    if (!storyContent.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newId = Date.now().toString();
      const newStory = {
        id: newId,
        content: storyContent,
        approved: true,
        createdAt: new Date().toISOString(),
        category: selectedCategory,
        reactions: { likes: 0 }
      };

      // Add new story to the top of the feed
      setStoriesList(prev => [newStory, ...prev]);

      // Initialize likes/comments for the new story
      setLikeCounts(prev => ({ ...prev, [newId]: 0 }));
      setLikedStories(prev => ({ ...prev, [newId]: false }));
      setUserComments(prev => ({ ...prev, [newId]: [] }));
      // New stories start with no initial comments

      dispatch(addStory(newStory));
      setIsSubmitting(false);
      setSubmitted(true);
      setStoryContent('');
      setSelectedCategory('general');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setShowSubmissionForm(false);
      }, 3000);
    }, 1500);
  };

  // Like button handler
  const handleLike = (storyId) => {
  const isLiked = likedStories[storyId];
  
  setLikeCounts(prevCounts => ({
    ...prevCounts,
    [storyId]: prevCounts[storyId] + (isLiked ? -1 : 1),
  }));

  setLikedStories(prevLiked => ({
    ...prevLiked,
    [storyId]: !isLiked,
  }));
};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Stories</h1>
          <p className="mt-2 text-gray-600">
            Share your experiences and learn from others in our supportive community
          </p>
        </div>
        
        {!showSubmissionForm && (
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Share Story
          </button>
        )}
      </div>

      {/* Story Submission Form */}
      {showSubmissionForm && (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Share Your Story</h2>
          
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank you for sharing!</h3>
              <p className="text-gray-600">Story submitted for review</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Story
                </label>
                <textarea
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  placeholder="Share your experience, insights, or advice that might help others..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Anonymous Sharing:</strong> Your story will be shared anonymously
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleSubmitStory}
                  disabled={!storyContent.trim() || isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Story'}
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
      <div className="space-y-6">
        {storiesList.map((story) => {
          const userCommentCount = userComments[story.id]?.length || 0;
          const initCommentCount = initialComments[story.id]?.length || 0;
          const isCommentsOpen = openComments[story.id];
          const hasUserCommented = userCommentCount > 0;
          return (
            <div key={story.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {story.category}
                </span>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(story.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line">{story.content}</p>
              </div>

              {/* Comments List (only show if open) */}
              {isCommentsOpen && (
                <div className="mb-4">
                  <div className="font-semibold text-gray-700 mb-2">Comments:</div>
                  <ul className="space-y-2">
                    {/* Initial comments (plain, not colored, not removable) */}
                    {initialComments[story.id] && initialComments[story.id].map((c, idx) => (
                      <li
                        key={`init-${idx}`}
                        className="bg-gray-50 text-gray-900 px-3 py-2 rounded"
                      >
                        {c}
                      </li>
                    ))}
                    {/* User comments (colored, removable) */}
                    {userComments[story.id] && userComments[story.id].map((c, idx) => (
                      <li
                        key={`user-${idx}`}
                        className="bg-blue-50 text-blue-900 px-3 py-2 rounded flex items-center justify-between"
                      >
                        <span>{c}</span>
                        <button
                          className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                          onClick={() => handleRemoveComment(story.id, idx)}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  {/* Add Comment Input */}
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      value={commentInputs[story.id] || ''}
                      onChange={e =>
                        setCommentInputs(prev => ({
                          ...prev,
                          [story.id]: e.target.value
                        }))
                      }
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleComment(story.id)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      disabled={!commentInputs[story.id]?.trim()}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    className={`flex items-center space-x-2 transition-colors ${
                      likedStories[story.id]
                        ? 'text-red-600'
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                    onClick={() => handleLike(story.id)}
                  >
                    <Heart
                      className="h-4 w-4"
                      fill={likedStories[story.id] ? 'red' : 'none'}
                      stroke={likedStories[story.id] ? 'red' : 'currentColor'}
                    />
                    <span className="text-sm">{likeCounts[story.id]}</span>
                  </button>
                  <button
                    className={`flex items-center space-x-2 transition-colors ${
                      hasUserCommented
                        ? 'text-blue-600'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                    onClick={() =>
                      setOpenComments(prev => ({
                        ...prev,
                        [story.id]: !prev[story.id]
                      }))
                    }
                  >
                    <MessageSquare
                      className="h-4 w-4"
                      fill={hasUserCommented ? '#2563eb' : 'none'}
                      stroke={hasUserCommented ? '#2563eb' : 'currentColor'}
                    />
                    <span className="text-sm">{initCommentCount + userCommentCount}</span>
                  </button>
                </div>
                <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Share2 className="h-4 w-4" />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
          Load More Stories
        </button>
      </div>
    </div>
  );
};

export default StoriesPage;