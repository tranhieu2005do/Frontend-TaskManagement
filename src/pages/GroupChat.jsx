import React from 'react';
import { GroupChatProvider } from '../context/GroupChatContext';
import GroupChatSidebar from '../components/GroupChatSidebar';
import GroupChatMessages from '../components/GroupChatMessages';
import GroupChatInput from '../components/GroupChatInput';
import GroupChatMemberList from '../components/GroupChatMemberList';
import Sidebar from '../components/Sidebar';
import '../styles/groupChat.css';

/**
 * Main Group Chat page.
 * Uses the app-level Sidebar for navigation and composes the three-panel
 * group chat layout: conversation list | messages + input | member list.
 */
const GroupChat = () => {
    return (
        <div className="dashboard-layout">
            {/* App-wide sidebar */}
            <Sidebar />

            {/* Group Chat Module */}
            <div className="gc-container">
                {/* Left panel — group conversation list */}
                <GroupChatSidebar />

                {/* Center panel — messages + input */}
                <div className="gc-main">
                    <GroupChatMessages />
                    <GroupChatInput />
                </div>

                {/* Right panel — member list (hidden on mobile) */}
                <GroupChatMemberList />
            </div>
        </div>
    );
};

export default GroupChat;
