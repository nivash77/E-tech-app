import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ theme }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });

      localStorage.setItem('role', response.data.role);
      localStorage.setItem('email', email);
      localStorage.setItem('userName', response.data.name);

      switch (response.data.role) {
        case 'student': navigate('/dashboard'); break;
        case 'teacher': navigate('/teacher/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: setError('Unknown user role');
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Invalid credentials';
      setError(message);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`;
  const buttonClass = `w-full py-3 rounded-lg font-semibold transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`;
  const textClass = `${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`;

  return (
    <div className={`flex items-center justify-center min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`shadow-xl rounded-2xl p-10 w-full max-w-md border transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
        <h2 className="text-3xl font-extrabold text-center mb-8">Login to EdTech</h2>

        {error && <div className={`p-3 rounded mb-6 text-center text-sm font-medium ${theme === 'dark' ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'}`}>{error}</div>}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className={`block mb-2 text-sm font-medium ${textClass}`}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={inputClass} />
          </div>

          <div>
            <label className={`block mb-2 text-sm font-medium ${textClass}`}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={inputClass} />
          </div>

          <button type="submit" className={buttonClass}>Login</button>
        </form>

        <div className={`mt-6 flex justify-between text-sm ${textClass}`}>
          <a href="/signup" className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>Sign Up</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
