import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function Thread() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [reply, setReply] = useState('');

  useEffect(() => {
    const fetchThread = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/discussions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setThread(response.data);
      } catch (err) {
        console.error('Error fetching thread:', err);
      }
    };
    fetchThread();
  }, [id]);

  const handleReply = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/discussions/${id}/reply`,
        { content: reply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReply('');
      const response = await axios.get(`http://localhost:5000/api/discussions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThread(response.data);
    } catch (err) {
      console.error('Error posting reply:', err);
    }
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/discussions/${id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const response = await axios.get(`http://localhost:5000/api/discussions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setThread(response.data);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  if (!thread) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Discussion Thread</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <p>{thread.content}</p>
        <p className="text-sm text-gray-500">Posted by: {thread.user_name}</p>
        <p className="text-sm text-gray-500">Likes: {thread.likes}</p>
        <button
          onClick={handleLike}
          className="text-primary hover:underline"
        >
          Like
        </button>
      </div>
      <h3 className="text-xl font-semibold mb-2">Replies</h3>
      {thread.replies.map((reply) => (
        <div key={reply.id} className="bg-white p-4 rounded shadow mb-2 ml-4">
          <p>{reply.content}</p>
          <p className="text-sm text-gray-500">Posted by: {reply.user_name}</p>
        </div>
      ))}
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Write a reply..."
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        onClick={handleReply}
        className="bg-primary text-white p-2 rounded hover:bg-blue-700"
      >
        Reply
      </button>
    </div>
  );
}

export default Thread;