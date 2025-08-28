import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail({ theme }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem('email') || '';

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Email not found. Please go back and enter your email.');
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify`, { email, code });
      if (response.data.verified) {
        setSuccess('Email verified successfully! Redirecting to login...');
        localStorage.removeItem('email');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Invalid code. Please try again.');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Verification failed';
      setError(message);
    }
  };

  const resendCode = async () => {
    setError('');
    setSuccess('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-code`, { email });
      setSuccess('Verification code resent! Check your email.');
    } catch {
      setError('Failed to resend code.');
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`shadow-xl rounded-2xl p-10 w-full max-w-md border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h2 className="text-3xl font-extrabold text-center mb-8">Verify Your Email</h2>

        {error && <div className={`p-3 rounded mb-4 text-center text-sm ${theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>{error}</div>}
        {success && <div className={`p-3 rounded mb-4 text-center text-sm ${theme === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'}`}>{success}</div>}

        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Verification Code"
            required
            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
          />

          <button
            type="submit"
            className={`w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
          >
            Verify Email
          </button>
        </form>

        <p className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          Didn't receive the code?{' '}
          <button className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline font-medium`} onClick={resendCode}>
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
