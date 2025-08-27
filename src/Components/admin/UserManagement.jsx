import { useEffect, useState } from 'react';
import axios from 'axios';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ email: '', role: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError('Error fetching users');
      }
    };
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({ email: user.email, role: user.role });
  };

  const handleUpdate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(users.map((user) => (user.id === id ? { ...user, ...editForm } : user)));
      setEditingUser(null);
    } catch (err) {
      setError('Error updating user');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(users.filter((user) => user.id !== id));
    } catch (err) {
      setError('Error deleting user');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded shadow-md">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                {editingUser === user.id ? (
                  <>
                    <td className="p-2">
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-1 border rounded"
                      />
                    </td>
                    <td className="p-2">
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full p-1 border rounded"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => handleUpdate(user.id)}
                        className="text-green-500 hover:underline mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary hover:underline mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;