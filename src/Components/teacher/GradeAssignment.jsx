import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function GradeAssignment({theme}) {
  const { id } = useParams(); // Submission ID
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [grade, setGrade] = useState('');
  const [user,setUser]=useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;
const [assignment, setAssignment] = useState(null);
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const email = localStorage.getItem('email');
        const submissionRes=await axios.get(`${API_URL}/submissions/${id}`,{headers:{email}});
        console.log(submissionRes.data);
        const response = await axios.get(`${API_URL}/submissions/assignment/${submissionRes.data.assignmentId}`, {
          headers: { email },
        });
        const assignmentRes = await axios.get(`${API_URL}/assignments/${submissionRes.data.assignmentId}`);
        setAssignment(assignmentRes.data);
        const User =await axios.get(`${API_URL}/auth/${submissionRes.data.studentId}`);
        setUser(User.data);
        //console.log(User.data);
        setSubmission(response.data);
        setGrade(response.data.grade || '');
        setFeedback(response.data.feedback || '');
      } catch (err) {
        console.error(err);
        setError('Error fetching submission');
      }
    };

    fetchSubmission();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const email = localStorage.getItem('email');
      await axios.put(
        `${API_URL}/submissions/grade/${id}`,
        null,
        {
          headers: { email },
          params: { grade, feedback },
        }
      );
      alert('Grade submitted successfully!');
      await axios.post(`${API_URL}/notifications/createForGarde`,null,{
        params:{type:"grade",message:`Grade for Your assigmnet of ${assignment.title} is grade:${grade}`,submissionId:id},
        
      })
      navigate('/teacher/dashboard'); 
    } catch (err) {
      console.error(err);
      setError('Error submitting grade');
    }
  };

  if (!submission) return <div>Loading...</div>;

  return (
   <div className={`container mx-auto p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>

      <h2 className="text-2xl font-bold mb-4">Grade Assignment</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
<div className={`container mx-auto  p-6 rounded shadow-md ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>

     
        <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
        <p className="mb-2">Submitted by: {user.email}</p>
        <p className="mb-4">
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Submission
          </a>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Grade</label>
          <input
            type="number"
            value={grade}
            placeholder='Enter grade (0-10)'
            onChange={(e) => setGrade(e.target.value)}
            min="0"
            max="100"
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows="4"
            className="w-full border p-2 rounded"
            placeholder="Provide feedback"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Submit Grade
        </button>
      </div>
    </div>
  );
}

export default GradeAssignment;
