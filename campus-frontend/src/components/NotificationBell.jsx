import React, { useState, useEffect, useRef } from 'react';
import { getNotifications, markAsRead } from '../api/notification';

const NotificationBell = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userId = user?.id || (user?.role === 'admin' ? 'admin' : '');
  const role = user?.role;

  const fetchNotifications = async () => {
    if (!role) return;
    const res = await getNotifications(userId, role);
    if (res?.success) {
      setNotifications(res.data || []);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [userId, role]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    
    if (nextState && unreadCount > 0) {
      await markAsRead(userId, role);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const unreadCount = (notifications || []).filter(n => n.read === false).length;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getIcon = (message) => {
    const msg = (message || "").toLowerCase();
    if (msg.includes('complaint submitted') || msg.includes('new complaint')) return '📩';
    if (msg.includes('assigned')) return '🛠';
    if (msg.includes('resolved')) return '✅';
    return '📢';
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Icon & Badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-500 hover:text-blue-600 transition-all duration-300 focus:outline-none cursor-pointer group"
      >
        <span className="text-2xl group-hover:scale-110 transition-transform block">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse border-2 border-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-gray-100 overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200 ease-out">
          {/* Header */}
          <div className="bg-white px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-bold">
                {unreadCount} New
              </span>
            )}
          </div>
          
          {/* List Area */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <span className="text-3xl mb-2 opacity-20">📭</span>
                <p className="text-gray-400 font-medium text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-default hover:bg-gray-50 group ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Icon Column */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-lg">
                      {getIcon(n.message)}
                    </div>

                    {/* Content Column */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-relaxed mb-0.5 ${!n.read ? 'font-black text-gray-900' : 'text-gray-500'}`}>
                        {n.message}
                      </p>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>

                    {/* Unread Dot Indicator */}
                    {!n.read && (
                      <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer (Optional, keeps it clean) */}
          {notifications.length > 0 && (
            <div className="bg-gray-50/50 px-5 py-2 border-t border-gray-100 text-center">
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                Latest Updates
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
