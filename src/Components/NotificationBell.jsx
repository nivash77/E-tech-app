import axios from "axios";
import { useState, useEffect } from "react";

function NotificationBell({ theme }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const API_URL = import.meta.env.VITE_API_URL;
  const userEmail = localStorage.getItem("email");
  const isDark = theme === "dark";

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_URL}/notifications`, {
          headers: { email: userEmail },
          params: {
            page: currentPage - 1, // assuming backend pagination starts at 0
            size: pageSize,
          },
        });
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [API_URL, userEmail, currentPage]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Mark a single notification as read
  const handleNotificationClick = async (notifId) => {
    try {
      await axios.post(`${API_URL}/notifications/${notifId}/read`, null, {
        headers: { email: userEmail },
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Filter notifications based on toggle
  const filteredNotifications = showUnreadOnly
    ? notifications.filter((n) => !n.read)
    : notifications;

  // Pagination logic (client-side, even if backend sends full list)
  const startIndex = (currentPage - 1) * pageSize;
  const currentNotifications = filteredNotifications.slice(
    startIndex,
    startIndex + pageSize
  );

  const totalPages = Math.ceil(filteredNotifications.length / pageSize);

  // Theme-based classes
  const bellBg = isDark ? "text-white" : "text-gray-700";
  const dropdownBg = isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900";
  const hoverBg = isDark ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const titleColor = isDark ? "text-white" : "text-gray-700";

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button onClick={() => setOpen(!open)} className={`relative ${bellBg}`}>
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={`absolute right-0 mt-2 w-72 shadow-lg rounded-lg p-3 z-50 ${dropdownBg}`}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className={`font-bold ${titleColor}`}>Notifications</h3>
            <button
              onClick={() => {
                setShowUnreadOnly(!showUnreadOnly);
                setCurrentPage(1); // reset to first page when toggling
              }}
              className="text-blue-500 text-sm hover:underline"
            >
              {showUnreadOnly ? "Show All" : "Show Unread"}
            </button>
          </div>

          {filteredNotifications.length > 0 ? (
            <>
              {currentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id)}
                  className={`p-2 border-b last:border-none cursor-pointer ${hoverBg}`}
                >
                  <span className={notif.read ? "font-normal" : "font-bold"}>
                    {notif.message}
                  </span>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className={`text-blue-500 text-sm hover:underline disabled:text-gray-400`}
                  >
                    Prev
                  </button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className={`text-blue-500 text-sm hover:underline disabled:text-gray-400`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-sm">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
