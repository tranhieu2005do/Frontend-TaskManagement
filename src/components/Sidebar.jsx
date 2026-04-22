import React, { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import websocketService from '../socket/websocketService';
import { NotificationContext } from '../context/NotificationContext';
import '../styles/dashboard.css';
import { logoutUser } from '../api/authApi';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, hasNewNotification, markAllRead } = useContext(NotificationContext);

  const [isProfileExpanded, setIsProfileExpanded] = useState(false);

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    {
      label: 'Notifications',
      path: '/notifications',
      badge: unreadCount > 99 ? '99+' : (unreadCount > 0 ? unreadCount : null),
    },
    { label: 'My Tasks', path: '/tasks' },
    { label: 'My Teams', path: '/teams' },
    { label: 'Group Chat', path: '/group-chat' },
    // { label: 'Create Team', path: '/create-team', divider: true },
  ];

  const profileSubItems = [
    { label: 'My Profile', path: '/profile' },
    { label: 'Change Password', action: 'changePassword' },
    { label: 'Edit Profile', action: 'editProfile' },
  ];

  const handleNavigation = (path) => {
    if (path === '/notifications') {
      markAllRead();
    }
    navigate(path);
  };

  const handleProfileClick = () => {
    setIsProfileExpanded((prev) => !prev);
    navigate('/profile');
  };

  const handleSubItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      window.dispatchEvent(
        new CustomEvent('openModal', {
          detail: { modalType: item.action },
        })
      );
    }
  };

  const handleLogout = () => {
    // Clear sessionStorage
    logoutUser();
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>TaskFlow</h2>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item, index) => (
          <div key={index}>
            <button
              className={`menu-item ${location.pathname === item.path ? 'active' : ''
                } ${item.path === '/notifications' && hasNewNotification ? 'highlight' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="menu-label">{item.label}</span>
              {item.badge ? (
                <span key={item.badge} className="menu-badge">{item.badge}</span>
              ) : null}
            </button>
            {item.divider && <div className="menu-divider"></div>}
          </div>
        ))}

        {/* Profile settings + sub-menu */}
        <div className="nav-item-group">
          <button
            className={`menu-item ${location.pathname.startsWith('/profile') ? 'active' : ''
              }`}
            onClick={handleProfileClick}
          >
            <span className="menu-label">Profile Settings</span>
            {/* <span className={`expand-icon ${isProfileExpanded ? 'expanded' : ''}`}>
              ▼
            </span> */}
          </button>
          {isProfileExpanded && (
            <div className="nav-submenu">
              {profileSubItems.map((item, index) => (
                <button
                  key={index}
                  className={`menu-item nav-subitem ${location.pathname === item.path ? 'active' : ''
                    }`}
                  onClick={() => handleSubItemClick(item)}
                >
                  <span className="menu-label">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
