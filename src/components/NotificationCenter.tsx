import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Notification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  requestNotificationPermission
} from '../services/notificationService';

const NotificationCenter: React.FC = () => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Memoize fetchNotifications to avoid dependency issues
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const userNotifications = await getUserNotifications(currentUser.uid);
      setNotifications(userNotifications);
    } catch (err: any) {
      setError('Failed to fetch notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // Request notification permission when component mounts
    requestNotificationPermission();
    
    // Fetch notifications
    if (currentUser) {
      fetchNotifications();
    }
    
    // Set up interval to check for new notifications
    const interval = setInterval(() => {
      if (currentUser) {
        fetchNotifications();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [currentUser, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (err: any) {
      setError('Failed to mark notification as read: ' + err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await markAllNotificationsAsRead(currentUser.uid);
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    } catch (err: any) {
      setError('Failed to mark all notifications as read: ' + err.message);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (err: any) {
      setError('Failed to delete notification: ' + err.message);
    }
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-xs text-white text-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1">
            <div className="px-4 py-2 border-b flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-900"
                >
                  Mark all as read
                </button>
              )}
            </div>
            
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No notifications</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`px-4 py-2 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id!)}
                            className="text-xs text-indigo-600 hover:text-indigo-900"
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id!)}
                          className="text-xs text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 