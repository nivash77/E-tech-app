import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from '../NotificationBell';

function Header({ onToggleTheme, theme}) {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const role = localStorage.getItem('role');
  const username=localStorage.getItem('userName');
  const handleAuthAction = () => {
    if (email) {
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-[var(--primary)] text-[var(--text-color)] shadow-md transition-colors duration-300">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:opacity-90">
          EdTech Platform
        </Link>

        <div className="flex items-center gap-4 text-sm font-medium">
          {email && <NotificationBell theme={theme}/>}

          {email && role === 'student' && username && <Link to="/dashboard" className="hover:underline">{username} Dashboard</Link>}
          {email && role === 'teacher' && username && <Link to="/teacher/dashboard" className="hover:underline">{username} Dashboard</Link>}
          {email && role === 'admin' && <Link to="/admin/dashboard" className="hover:underline">Admin Dashboard</Link>}

          <button onClick={handleAuthAction} className="hover:underline">{email ? 'Logout' : 'Login'}</button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="relative w-14 h-7 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center px-1 cursor-pointer transition"
          >
            <span
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-7' : ''
              }`}
            ></span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
