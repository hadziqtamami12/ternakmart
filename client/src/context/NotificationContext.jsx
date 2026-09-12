// NotificationContext.jsx - Real-Time In-App Center & Audio Alert Ding
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { useAuth } from './AuthContext';
import { playNotificationSound } from '../utils/sound';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const previousUnreadRef = useRef(0);

  const fetchNotifications = async (isInitial = false) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await api.get('/notifications/my');
      if (res.success && res.data) {
        const newUnread = res.data.unread_count || 0;

        // Play ding audio alert if new unread notification arrived
        if (!isInitial && newUnread > previousUnreadRef.current) {
          playNotificationSound();
        }

        previousUnreadRef.current = newUnread;
        setNotifications(res.data.notifications || []);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      // Quiet fail on network hiccups
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications(true);

    // Polling interval for live notification updates
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 15000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id]);

  const markAsRead = async (notifId) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.warn('Could not mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn('Could not mark all notifications as read:', err);
    }
  };

  const triggerTestDing = async () => {
    try {
      playNotificationSound();
      await api.post('/notifications/demo-trigger', {
        title: '🔔 Uji Coba Audio Notifikasi',
        message: 'Nada dering sintetis aktif dan data notifikasi berhasil diperbarui secara real-time.'
      });
      await fetchNotifications(false);
    } catch (err) {
      console.warn('Test trigger error:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isOpen,
        setIsOpen,
        markAsRead,
        markAllAsRead,
        refreshNotifications: () => fetchNotifications(false),
        triggerTestDing
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
