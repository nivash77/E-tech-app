import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Signup({ theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { email, password, role, name });

      // Save email for verification page
      localStorage.setItem('email', email);

      // Send OTP
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-code`, { email });

      setSuccess('Registered successfully! Please verify your email.');
      
      // Redirect to verify page
      navigate('/verify-email', { state: { email } });
    } catch (err) {
      const message = err.response?.data?.error || 'Signup failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`;
  const buttonClass = `w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;
  const textClass = `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`;

  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`shadow-xl rounded-2xl p-10 w-full max-w-md border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h2 className="text-3xl font-extrabold text-center mb-8">Create Your Account</h2>

        {error && <div className={`p-3 rounded mb-4 text-center text-sm ${theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>{error}</div>}
        {success && <div className={`p-3 rounded mb-4 text-center text-sm ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>{success}</div>}

        <form onSubmit={handleSignup} className="space-y-5">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name with initials" required className={inputClass} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className={inputClass} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className={inputClass} />
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
          <button type="submit" disabled={loading} className={buttonClass}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${textClass}`}>
          Already have an account?{' '}
          <a href="/login" className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline font-medium`}>Login</a>
        </p>
      </div>
    </div>
  );
}

export default Signup;
