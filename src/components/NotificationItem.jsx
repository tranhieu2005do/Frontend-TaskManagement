import React from 'react';
import '../styles/dashboard.css';

const NotificationItem = ({ notification, onToggleRead }) => {
  const isRead = notification.isRead;

  return (
    <div className={`notification-card ${isRead ? 'notification-read' : 'notification-unread'}`}>
      <div className="notification-icon"></div>
      <div className="notification-content">
        <div className="notification-text">{notification.message || notification.content}</div>
        <div className="notification-meta-row">
          <span className="notification-date">
            {new Date(notification.createdAt || notification.created_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <button className="notification-action-btn" onClick={() => onToggleRead(notification)}>
            {isRead ? 'Mark unread' : 'Mark read'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
