import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markNotificationUnread,
  markAllNotificationsRead,
} from '../api/notificationApi';
import websocketService from '../socket/websocketService';

export const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  refreshNotifications: () => { },
  setRead: () => { },
  setUnread: () => { },
  markAllRead: () => { },
});

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const refreshNotifications = useCallback(async () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data.content) ? data.content : []);

      // Fetch actual unread count specifically
      const countData = await getUnreadCount();
      setUnreadCount(Number(countData) || 0);
    } catch (err) {
      console.error('NotificationContext refresh error', err);
      setError(err?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const setRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        (n.id ?? n.notification_id) === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(prev - 1, 0));
  };

  const setUnread = async (id) => {
    try {
      await markNotificationUnread(id);
      await refreshNotifications();
    } catch (err) {
      console.error('setUnread error', err);
    }
  };

  const addNotification = useCallback((notification) => {
    if (!notification) return;

    setNotifications((prevNotifications) => {
      const key = notification.id ?? notification.notification_id;
      if (!key) {
        return [notification, ...prevNotifications];
      }

      const exists = prevNotifications.some((item) => {
        const itemKey = item.id ?? item.notification_id;
        return itemKey === key;
      });
      if (exists) return prevNotifications;

      return [notification, ...prevNotifications];
    });
    // Increase unread count for new notification
    setUnreadCount((prev) => prev + 1);
    setHasNewNotification(true);
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      await refreshNotifications();
      setHasNewNotification(false);
      setUnreadCount(0);
    } catch (err) {
      console.error('markAllRead error', err);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    const token = sessionStorage.getItem('authToken');
    if (token) {
      refreshNotifications();
    } else {
      setLoading(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    const user_id = sessionStorage.getItem('user_id');
    const token = sessionStorage.getItem('authToken');

    if (!user_id || !token || user_id === 'null') {
      return;
    }

    const unsubscribe = websocketService.subscribe(`/topic/notification-tasks/${user_id}`, (notification) => {
      if (notification) {
        addNotification(notification);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        refreshNotifications,
        setRead,
        setUnread,
        markAllRead,
        addNotification,
        hasNewNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
