import React, { useContext, useMemo, useState, useEffect } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import Sidebar from '../components/Sidebar';
import NotificationItem from '../components/NotificationItem';
import '../styles/dashboard.css';

const Notifications = () => {
  const { notifications, loading, error, setRead, setUnread, markAllRead } = useContext(NotificationContext);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') return notifications.filter((item) => !item.isRead);
    if (filter === 'read') return notifications.filter((item) => item.isRead);
    return notifications;
  }, [filter, notifications]);

  const onToggleRead = (notification) => {
    if (notification.isRead) {
      setUnread(notification.id);
    } else {
      setRead(notification.id);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content notifications-page">
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>

          <div className="notifications-controls">
            <div className="filter-tabs">
              {['all', 'unread', 'read'].map((tab) => (
                <button
                  key={tab}
                  className={`tab ${filter === tab ? 'active' : ''}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <button className="mark-all-btn" onClick={markAllRead}>
              ✓ Mark All Read
            </button>
          </div>
        </div>

        {error && <div className="dashboard-error">{error}</div>}
        {loading ? (
          <div className="dashboard-loading">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="empty-state">No notifications at the moment.</div>
        ) : (
          <div className="notification-list">
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onToggleRead={onToggleRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
