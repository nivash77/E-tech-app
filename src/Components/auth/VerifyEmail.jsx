import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function VerifyEmail() {
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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-10 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-8">Verify Your Email</h2>

        {error && <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded mb-4 text-center text-sm">{error}</div>}
        {success && <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 p-3 rounded mb-4 text-center text-sm">{success}</div>}

        <form onSubmit={handleVerify} className="space-y-5">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Verification Code"
            required
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Verify Email
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Didn't receive the code?{' '}
          <button
            onClick={resendCode}
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}

export default VerifyEmail;
