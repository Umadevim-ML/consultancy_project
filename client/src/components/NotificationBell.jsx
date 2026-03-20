
import React, { useContext, useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { NotificationContext } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-white hover:text-yellow-400 focus:outline-none flex items-center"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded shadow-xl py-2 z-50 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="px-4 py-2 flex justify-between items-center border-b border-gray-100">
                        <h3 className="font-bold text-sm text-gray-700">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        <ul>
                            {notifications.map((notif) => (
                                <li
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        notif.isRead ? 'opacity-75' : 'bg-blue-50/30'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        {!notif.isRead && (
                                            <div className="w-2 h-2 mt-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                                        )}
                                        <div>
                                            <p className={`text-sm ${notif.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                {new Date(notif.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
