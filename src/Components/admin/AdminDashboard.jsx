import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [usersRes, coursesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/users', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/admin/courses/pending', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(usersRes.data);
        setPendingCourses(coursesRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">User Management</h3>
          <Link to="/admin/users" className="text-primary hover:underline">Manage Users</Link>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Pending Course Approvals</h3>
          {pendingCourses.map((course) => (
            <div key={course.id} className="bg-white p-4 rounded shadow mb-4">
              <p>{course.title}</p>
              <button className="text-green-500 hover:underline mr-4">Approve</button>
              <button className="text-red-500 hover:underline">Reject</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;