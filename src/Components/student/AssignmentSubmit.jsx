import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function AssignmentSubmit({ theme }) {
  const { id, assignmentId } = useParams(); 
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null); // store existing submission
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const fetchData = async () => {
    try {
      const email = localStorage.getItem('email');

      // Fetch assignment details
      const assignmentRes = await axios.get(`${import.meta.env.VITE_API_URL}/assignments/${assignmentId}`);
      setAssignment(assignmentRes.data);

      // Fetch submissions
      const submissionRes = await axios.get(`${import.meta.env.VITE_API_URL}/submissions/student`, { headers: { email } });
      //console.log(submissionRes.data);
      // Safely find existing submission
      const existing = submissionRes.data.find(s => {
        const subId = s.assignment?.id ?? s.assignmentId;
        return String(subId) === assignmentId;
      });
      
      if (existing) setSubmission(existing);
    } catch (err) {
      //console.log(err);
      setError('Failed to load assignment or submission details');
    }
  };
  fetchData();
}, [assignmentId]);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB');
      setFile(null);
      return;
    }
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type)) {
      setError('Only PDF and DOCX files are allowed');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const email = localStorage.getItem('email');

    try {
      if (submission) {
        // Update existing submission
        await axios.put(`${import.meta.env.VITE_API_URL}/submissions/update/${submission.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', email },
        });
        setSuccess('Assignment updated successfully!');
      } else {
        // Add new submission
        await axios.post(`${import.meta.env.VITE_API_URL}/submissions/add`, formData, {
          headers: { 'Content-Type': 'multipart/form-data', email },
          params: { assignmentId },
        });
        setSuccess('Assignment submitted successfully!');
      }
      await axios.post(`${import.meta.env.VITE_API_URL}/notifications/create`, null, {
        params: { type: "Assignment submission", message: `You submitted the assignment of ${assignment.title}` },
        headers: { email },
      });

      navigate(`/dashboard`);
    } catch (err) {
      console.log(err);
      setError('Failed to submit assignment');
    }
  };

  if (!assignment) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'text-gray-400 bg-gray-900' : 'text-gray-600 bg-gray-100'}`}>
        Loading assignment...
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-6 py-10 flex justify-center caret-transparent ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`w-full max-w-xl max-h-96 rounded-2xl shadow-lg p-8 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <h2 className="text-3xl font-bold mb-6">{assignment.title}</h2>
        <p className="mb-4">{assignment.description}</p>
        <p className="mb-6">Due Date: {new Date(assignment.deadline).toLocaleDateString()}</p>

        <input type="file" onChange={handleFileChange} className="mb-4 w-full text-sm" />
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {success && <p className="text-green-500 mb-2">{success}</p>}
        <div className='flex justify-around gap-4'>
        <button
          onClick={handleSubmit}
          className={`px-6 py-3 mt-4 rounded-lg transition text-white ${
            submission ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {submission ? 'Edit Submission' : 'Submit Assignment'}
        </button>
          <button onClick={() => navigate('/dashboard')} className="bg-gray-400 px-6 py-3 rounded  mt-4">Cancel</button>
          </div>
      </div>
    </div>
  );
}

export default AssignmentSubmit;
