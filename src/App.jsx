import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './Components/shared/Header';
import Footer from './Components/shared/Footer';
import Login from './Components/auth/Login';
import Signup from './Components/auth/Signup';
import VerifyEmail from './Components/auth/VerifyEmail';
import StudentDashboard from './Components/student/StudentDashboard';
import CourseView from './Components/student/CourseView';
import Quiz from './Components/student/Quiz';
import AssignmentSubmit from './Components/student/AssignmentSubmit';
import TeacherDashboard from './Components/teacher/TeacherDashboard';
import CourseEditor from './Components/teacher/CourseEditor';
import GradeAssignment from './Components/teacher/GradeAssignment';
import AdminDashboard from './Components/admin/AdminDashboard';
import UserManagement from './Components/admin/UserManagement';
import DiscussionBoard from './Components/forum/DiscussionBoard';
import Thread from './Components/forum/Thread';
import CourseBuilder from './Components/teacher/CourseBuilder';
import AllCourses from './Components/student/AllCourse';
import AssignmentManager from './Components/teacher/AssignmentManager';
function ProtectedRoute({ children }) {
  const email = localStorage.getItem('email');
  return email ? children : <Navigate to="/login" />;
}

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };
  const username=localStorage.getItem('userName');
  return (
    <Router>
      <Header onToggleTheme={toggleTheme} theme={theme} username={username} />

      <div className="min-h-screen transition-colors duration-300 bg-[var(--background)] text-[var(--text-color)]">
        <Routes>
          <Route path="/login" element={<Login theme={theme} />} />
          <Route path="/signup" element={<Signup theme={theme} />} />
          <Route path="/verify-email" element={<VerifyEmail theme={theme}/>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard theme={theme}/></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseView theme={theme}/></ProtectedRoute>} />
          <Route path="/courses/:id/quiz/:quizId" element={<ProtectedRoute><Quiz /></ProtectedRoute>} />
          <Route path="/courses/:id/assignment/:assignmentId" element={<ProtectedRoute><AssignmentSubmit theme={theme}/></ProtectedRoute>} />
          <Route path="/teacher/dashboard" element={<ProtectedRoute><TeacherDashboard theme={theme}/></ProtectedRoute>} />
          <Route path="/teacher/courses/edit/:id" element={<ProtectedRoute><CourseEditor theme={theme} /></ProtectedRoute>} />
          <Route path="/teacher/assignments/grade/:id" element={<ProtectedRoute><GradeAssignment theme={theme}/></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
          <Route path="/courses/:id/discussions" element={<ProtectedRoute><DiscussionBoard theme={theme}/></ProtectedRoute>} />
          <Route path="/discussions/:id" element={<ProtectedRoute><Thread /></ProtectedRoute>} />
          <Route path="/teacher/courses/add" element={<CourseBuilder theme={theme} />} />
          <Route path="/all-courses" element={<ProtectedRoute><AllCourses theme={theme}/></ProtectedRoute>} />
         <Route path="/teacher/assignments" element={<ProtectedRoute><AssignmentManager theme={theme}/></ProtectedRoute>} />
          {/* Redirect unknown routes to login */}
          <Route path="/" element={<Login theme={theme}/>} />
        </Routes>
      </div>

      <Footer />
    </Router>
  );
}

export default App;
