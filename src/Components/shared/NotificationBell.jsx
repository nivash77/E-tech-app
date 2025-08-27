import { useEffect, useState } from 'react';
import axios from 'axios';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/notifications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(response.data.filter((n) => !n.is_read));
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg z-10">
          {notifications.length === 0 ? (
            <p className="p-4 text-gray-500">No new notifications</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-4 border-b">
                <p>{notification.message}</p>
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-primary hover:underline text-sm"
                >
                  Mark as read
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;