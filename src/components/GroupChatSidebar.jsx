import React, { useContext, useState, useMemo } from 'react';
import { GroupChatContext } from '../context/GroupChatContext';
import { formatRelativeTime } from '../utils/dateUtils';
import { formatSenderName } from '../utils/stringUtils';

/**
 * Sidebar panel showing all group conversations.
 * Displays group name, last message preview, time, and highlights the selected group.
 */
const GroupChatSidebar = () => {
    const { groups, selectedGroup, selectGroup, unreadCounts, loading } =
        useContext(GroupChatContext);
    const [search, setSearch] = useState('');

    // Filter and Sort groups by search query and last activity
    const filteredGroups = useMemo(() => {
        let result = groups;
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter((g) =>
                g.name.toLowerCase().includes(query)
            );
        }

        // Ensure list is sorted by last_updated (Messenger behavior)
        return [...result].sort((a, b) => {
            const timeA = new Date(a.last_updated || 0);
            const timeB = new Date(b.last_updated || 0);
            return timeB - timeA;
        });
    }, [groups, search]);

    return (
        <div className="gc-sidebar">
            {/* Header */}
            <div className="gc-sidebar-header">
                <h2 className="gc-sidebar-title">💬 Chats</h2>
            </div>

            {/* Search */}
            <div className="gc-search-box">
                <input
                    type="text"
                    className="gc-search-input"
                    placeholder="Search groups..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                    <button className="gc-search-clear" onClick={() => setSearch('')}>
                        ✕
                    </button>
                )}
            </div>

            {/* Group List */}
            <div className="gc-group-list">
                {loading && (
                    <div className="gc-loading">Loading groups...</div>
                )}

                {!loading && filteredGroups.length === 0 && (
                    <div className="gc-empty">
                        {search ? 'No groups match your search' : 'No groups found'}
                    </div>
                )}

                {filteredGroups.map((group) => {
                    const isSelected = selectedGroup?.id === group.id;
                    const unreadCount = unreadCounts[group.name] || 0;
                    const isUnread = unreadCount > 0;
                    const hasFlash = group.hasNewMessage;

                    return (
                        <button
                            key={group.id}
                            className={`gc-group-item ${isSelected ? 'gc-group-item--active' : ''} ${isUnread ? 'gc-group-item--unread' : ''} ${hasFlash ? 'gc-group-item--flash' : ''}`}
                            onClick={() => selectGroup(group)}
                        >
                            {/* Left: Avatar */}
                            <div className="gc-group-avatar">
                                {(group.name || '?')[0].toUpperCase()}
                                {isUnread && <span className="gc-member-status gc-member-status--unread" />}
                            </div>

                            {/* Center: Info */}
                            <div className="gc-group-content">
                                <div className="gc-group-top-row">
                                    <span className="gc-group-name">{group.name}</span>
                                    {group.last_updated && (
                                        <span className="gc-group-time">
                                            {formatRelativeTime(group.last_updated)}
                                        </span>
                                    )}
                                </div>
                                <div className="gc-group-bottom-row">
                                    <span className="gc-group-last-msg">
                                        {group.last_message ? (
                                            <>
                                                <span className="last-sender-name">
                                                    {formatSenderName(group.last_sender)}
                                                </span>
                                                : {group.last_message}
                                            </>
                                        ) : (
                                            `Member list (${group.number_of_members || 0})`
                                        )}
                                    </span>
                                    {isUnread && (
                                        <span className="gc-unread-badge">
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default GroupChatSidebar;
