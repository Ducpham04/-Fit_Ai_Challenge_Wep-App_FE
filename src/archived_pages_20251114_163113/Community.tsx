import { motion } from 'motion/react';
import { Heart, MessageCircle, Share2, Plus } from 'lucide-react';
import { mockCommunityPosts } from '../api/mockData';
import { useState } from 'react';

export const Community = () => {
  const [posts, setPosts] = useState(mockCommunityPosts);
  const [showNewPost, setShowNewPost] = useState(false);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl text-gray-900 mb-2">Community</h1>
            <p className="text-xl text-gray-600">
              Share your fitness journey with others
            </p>
          </div>
          <button
            onClick={() => setShowNewPost(!showNewPost)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Post</span>
          </button>
        </motion.div>

        {/* New Post Form */}
        {showNewPost && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <textarea
              placeholder="Share your fitness achievement..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
              rows={4}
            />
            <div className="flex justify-between items-center mt-4">
              <button className="text-gray-600 hover:text-sky-500 transition-colors">
                📷 Add Photo
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Post created! 🎉');
                    setShowNewPost(false);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-sky-400 to-lime-400 text-white rounded-lg hover:shadow-lg transition-shadow"
                >
                  Post
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={post.avatar}
                    alt={post.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-gray-900">{post.username}</p>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-700 mb-4">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-96 object-cover"
                />
              )}

              {/* Post Actions */}
              <div className="p-6 pt-4">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors group"
                  >
                    <Heart className="w-5 h-5 group-hover:fill-red-500" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-sky-500 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-lime-500 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button className="px-6 py-3 border-2 border-sky-500 text-sky-500 rounded-lg hover:bg-sky-50 transition-colors">
            Load More Posts
          </button>
        </motion.div>
      </div>
    </div>
  );
};
