import React, { useContext, useState } from 'react';
import { GroupChatContext } from '../context/GroupChatContext';

/**
 * Collapsible member list showing team members for the selected group.
 * Displays a colored online/offline indicator dot beside each member.
 *
 * Note: True online presence requires a backend presence channel.
 * For now, all members default to "offline" — this can be extended
 * with a presence subscription when the backend supports it.
 */
const GroupChatMemberList = () => {
    const { members, selectedGroup } = useContext(GroupChatContext);
    const [collapsed, setCollapsed] = useState(false);

    if (!selectedGroup) return null;

    return (
        <div className={`gc-members ${collapsed ? 'gc-members--collapsed' : ''}`}>
            {/* Header with toggle */}
            <button
                className="gc-members-header"
                onClick={() => setCollapsed((c) => !c)}
            >
                <h3 className="gc-members-title">
                    Members ({members.length})
                </h3>
                <span className={`gc-members-toggle ${collapsed ? '' : 'gc-members-toggle--open'}`}>
                    ▶
                </span>
            </button>

            {/* Member list */}
            {!collapsed && (
                <div className="gc-members-list">
                    {members.length === 0 && (
                        <div className="gc-members-empty">No members found</div>
                    )}

                    {members.map((member, idx) => {
                        // Simulate online status — in production, compare against
                        // a presence channel or online user IDs set.
                        const isOnline = false;

                        return (
                            <div
                                key={member.user_id || idx}
                                className="gc-member-item"
                            >
                                {/* Avatar */}
                                <div className="gc-member-avatar">
                                    {(member.user_name || '?')[0].toUpperCase()}
                                    <span
                                        className={`gc-member-status ${isOnline ? 'gc-member-status--online' : 'gc-member-status--offline'}`}
                                    />
                                </div>

                                {/* Info */}
                                <div className="gc-member-info">
                                    <span className="gc-member-name">{member.user_name}</span>
                                    <span className="gc-member-role">
                                        {member.role || 'Member'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GroupChatMemberList;
