import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaThumbsUp } from 'react-icons/fa'; // import thumbs-up icon

function DiscussionBoard({ theme }) {
  const { id } = useParams(); // courseId
  const [posts, setPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [replies, setReplies] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchPosts();
    fetchTopLikedPosts();
  }, [id]);

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/discussions?courseId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data.content || response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  const fetchReplies = async (postId) => {
    try {
      const response = await axios.get(`${API_URL}/discussions/${postId}/replies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplies((prev) => ({ ...prev, [postId]: response.data }));
    } catch (err) {
      console.error('Error fetching replies:', err);
    }
  };

  const fetchTopLikedPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/discussions/${id}/top-liked?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopPosts(response.data);
    } catch (err) {
      console.error('Error fetching top liked posts:', err);
    }
  };

  const handlePost = async () => {
    if (!newPost.trim()) return;
    try {
      await axios.post(`${API_URL}/discussions/add`, { courseId: id, content: newPost }, {
        headers: { email: userEmail },
      });
      setNewPost('');
      fetchPosts();
      fetchTopLikedPosts();
    } catch (err) {
      console.error('Error posting discussion:', err);
    }
  };

  const handleReply = async (postId, replyContent) => {
    if (!replyContent.trim()) return;
    try {
      await axios.post(`${API_URL}/discussions/${postId}/reply`, { content: replyContent }, {
        headers: { email: userEmail },
      });
      fetchReplies(postId);
      fetchPosts();
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };

  const toggleLike = async (postId) => {
    try {
      await axios.post(`${API_URL}/discussions/${postId}/toggle-like`, null, {
        headers: { email: userEmail },
      });
      fetchPosts();
      fetchTopLikedPosts();
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // theme-based styles
  const bgClass = isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900';
  const postBg = isDark ? 'bg-gray-700' : 'bg-white';
  const replyBg = isDark ? 'bg-gray-600' : 'bg-gray-100';
  const inputBg = isDark ? 'bg-gray-700 text-white border-gray-500' : 'bg-white text-gray-900 border-gray-300';

  return (
    <div className={`container mx-auto p-4 ${bgClass}`}>
      <h2 className="text-2xl font-bold mb-4">Discussion Forum</h2>

      {/* New Post */}
      <textarea
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
        placeholder="Write a new post..."
        className={`w-full p-2 mb-2 border rounded ${inputBg}`}
      />
      <button
        onClick={handlePost}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700 mb-6"
      >
        Post
      </button>

      {/* Top Liked Posts */}
      {topPosts.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Top Liked Posts</h3>
          {topPosts.map((post) => (
            <div key={post.id} className={`p-3 rounded mb-2 border ${postBg}`}>
              <p>{post.content}</p>
              <p className="text-sm text-gray-400">Likes: {post.likes} | Replies: {post.replyCount}</p>
            </div>
          ))}
        </div>
      )}

      {/* All Posts */}
      {posts.map((post) => (
        <div key={post.id} className={`p-4 rounded shadow mb-4 ${postBg}`}>
          <div className="flex justify-between items-center mb-2">
            <Link to={`/discussions/${post.id}`} className="text-blue-400 hover:underline font-semibold">
              {post.content}
            </Link>
            <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1">
              <FaThumbsUp
                className={`transition-colors duration-200 ${post.likedUserEmails?.includes(userEmail) ? 'text-blue-500' : 'text-gray-400'}`}
              />
              <span>{post.likes}</span>
            </button>
          </div>
          <p className="text-sm text-gray-400 mb-2">Posted by: {post.userEmail} | Replies: {post.replyCount}</p>

          {/* Show Replies */}
          <button
            className="text-sm text-blue-400 hover:underline mb-2"
            onClick={() => fetchReplies(post.id)}
          >
            {replies[post.id] ? 'Refresh Replies' : 'View Replies'}
          </button>
          {replies[post.id] && (
            <div className="ml-4 mt-2 space-y-2">
              {replies[post.id].map((reply) => (
                <div key={reply.id} className={`p-2 rounded ${replyBg}`}>
                  <p>{reply.content}</p>
                  <p className="text-xs text-gray-300">By: {reply.userEmail}</p>
                </div>
              ))}
              <ReplyInput postId={post.id} handleReply={handleReply} theme={theme} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Reply Input Component
function ReplyInput({ postId, handleReply, theme }) {
  const [reply, setReply] = useState('');
  const isDark = theme === 'dark';
  const inputBg = isDark ? 'bg-gray-700 text-white border-gray-500' : 'bg-white text-gray-900 border-gray-300';

  const submitReply = () => {
    handleReply(postId, reply);
    setReply('');
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        type="text"
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write a reply..."
        className={`flex-1 p-2 border rounded ${inputBg}`}
      />
      <button className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600" onClick={submitReply}>
        Reply
      </button>
    </div>
  );
}

export default DiscussionBoard;
