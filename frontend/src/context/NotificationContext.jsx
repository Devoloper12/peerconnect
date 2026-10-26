import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNotificationsApi, markNotificationReadApi, clearAllNotificationsApi } from '../api/client';
import { useAuth } from './AuthContext';

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  stats: {},
  refreshNotifications: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {}
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await getNotificationsApi();
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 30 seconds for live updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications(prev => 
        prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Failed to mark notification read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markNotificationReadApi('all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to mark all notifications read:', err.message);
    }
  };

  const clearAll = async () => {
    try {
      await clearAllNotificationsApi();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.warn('Failed to clear notifications:', err.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        stats,
        loading,
        refreshNotifications: fetchNotifications,
        markAsRead,
        markAllAsRead,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
export default NotificationContext;
