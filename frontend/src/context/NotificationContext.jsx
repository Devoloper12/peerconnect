import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNotificationsApi, markNotificationReadApi, clearAllNotificationsApi } from '../api/client';
import { useAuth } from './AuthContext';

// Helper: Checks if a session notification is still active (not ended)
export const isNotificationActive = (notif) => {
  if (!notif) return false;
  if (!['SESSION', 'SESSION_REMINDER'].includes(notif.type)) return true;
  const msg = notif.message || '';

  // Pattern 1: "scheduled for 10/28/2026 at 8:00 AM"
  let m = msg.match(/scheduled for\s+([^\s]+)\s+at\s+([^.]+)/i);
  if (m) {
    const d = new Date(m[1].trim());
    if (!isNaN(d.getTime())) {
      const parts = m[2].trim().toUpperCase().replace(/[APM\s]/g, '').split(':');
      let h = parseInt(parts[0], 10) || 0;
      const min = parseInt(parts[1], 10) || 0;
      if (m[2].toUpperCase().includes('PM') && h < 12) h += 12;
      else if (m[2].toUpperCase().includes('AM') && h === 12) h = 0;
      const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, min, 0, 0);
      return dt.getTime() >= Date.now();
    }
  }

  // Pattern 2: "on Wed, Oct 28, 2026 at 8:00 AM." or "on Mon, Oct 26, 2026 at 5:15."
  m = msg.match(/on\s+(?:[A-Za-z]+,\s*)?([A-Za-z]+\s+\d{1,2},\s*\d{4})\s+at\s+([^.]+)/i);
  if (m) {
    const d = new Date(m[1].trim());
    if (!isNaN(d.getTime())) {
      const parts = m[2].trim().toUpperCase().replace(/[APM\s]/g, '').split(':');
      let h = parseInt(parts[0], 10) || 0;
      const min = parseInt(parts[1], 10) || 0;
      if (m[2].toUpperCase().includes('PM') && h < 12) h += 12;
      else if (m[2].toUpperCase().includes('AM') && h === 12) h = 0;
      const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, min, 0, 0);
      return dt.getTime() >= Date.now();
    }
  }

  // Pattern 3: Fallback "on <datePart> at <timePart>"
  m = msg.match(/on\s+([^.]+?)\s+at\s+([^.]+)/i);
  if (m) {
    const dateStr = m[1].trim().replace(/^[A-Za-z]+,\s*/, '');
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const parts = m[2].trim().toUpperCase().replace(/[APM\s]/g, '').split(':');
      let h = parseInt(parts[0], 10) || 0;
      const min = parseInt(parts[1], 10) || 0;
      if (m[2].toUpperCase().includes('PM') && h < 12) h += 12;
      else if (m[2].toUpperCase().includes('AM') && h === 12) h = 0;
      const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, min, 0, 0);
      return dt.getTime() >= Date.now();
    }
  }

  return true;
};

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
        const rawList = res.data.notifications || [];
        const activeList = rawList.filter(isNotificationActive);
        setNotifications(activeList);
        setUnreadCount(activeList.filter(n => !n.read).length);
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
