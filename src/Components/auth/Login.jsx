import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });

      // Save role and email for Axios interceptor and navigation
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('email', email);

      // Redirect based on role
      switch (response.data.role) {
        case 'student':
          navigate('/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          setError('Unknown user role');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid credentials';
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-10 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-8">Login to EdTech</h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-3 rounded mb-6 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
        
          <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
