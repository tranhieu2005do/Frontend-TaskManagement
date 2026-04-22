import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getGroupConversations, getGroupMembers, sendGroupMessage, getConversationMessages } from '../api/groupChatApi';
import websocketService from '../socket/websocketService';

export const GroupChatContext = createContext({
    groups: [],
    selectedGroup: null,
    messages: [],
    members: [],
    unreadCounts: {},
    loading: false,
    loadingMore: false,
    hasMore: true,
    error: null,
    selectGroup: () => { },
    sendMessage: () => { },
    loadMoreMessages: () => { },
    clearUnread: () => { },
});

export const GroupChatProvider = ({ children }) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [members, setMembers] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    // Track the current conversation subscription
    const currentConversationRef = useRef(null);

    // Load the user's groups/teams on mount
    useEffect(() => {
        const loadGroups = async () => {
            const userId = sessionStorage.getItem('user_id');
            if (!userId) return; // Do not fetch if user is not logged in
            
            setLoading(true);
            try {
                const data = await getGroupConversations(userId);
                console.log('Get conversation response:', data);
                setGroups(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load groups', err);
                setError('Failed to load groups');
            } finally {
                setLoading(false);
            }
        };
        loadGroups();
    }, []);


    // Handle incoming real-time message
    const handleIncomingMessage = useCallback(
        (msg) => {
            if (!msg) return;
            setMessages((prev) => {
                // Avoid duplicates by id
                if (msg.id && prev.some((m) => m.id === msg.id)) return prev;
                return [...prev, msg];
            });

            // If the message is for a different group than the selected one,
            // increment unread count (we use team_name as a key)
            // Since messages arrive on the subscribed conversation, this handles
            // the case where we subscribe to multiple conversations.
        },
        []
    );

    // Fetch messages for a specific conversation
    const fetchMessages = useCallback(async (conversationId, cursorId = null) => {
        const isInitial = cursorId === null;
        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const response = await getConversationMessages(conversationId, cursorId);
            const data = response?.data || [];

            // Backend returns messages in DESC order (newest first).
            // We need to reverse them for our ASC display.
            const formattedData = [...data].reverse();

            setMessages((prev) => {
                if (isInitial) return formattedData;
                // Prepend older messages to the top
                return [...formattedData, ...prev];
            });

            // If we received less than 20 messages, it means no more old ones
            setHasMore(data.length === 20);
        } catch (err) {
            console.error('Failed to fetch messages', err);
            setError('Failed to fetch messages');
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setLoadingMore(false);
            }
        }
    }, []);

    // Load more messages action
    const loadMoreMessages = useCallback(async () => {
        if (!selectedGroup || !hasMore || loadingMore) return;

        const firstMessageId = messages.length > 0 ? messages[0].id : null;
        if (firstMessageId) {
            await fetchMessages(selectedGroup.id, firstMessageId);
        }
    }, [selectedGroup, hasMore, loadingMore, messages, fetchMessages]);

    // Subscribe to all group conversations for unread tracking
    useEffect(() => {
        const unsubscribes = groups.map((group) => {
            const convId = group.id;
            if (!convId) return null;

            return websocketService.subscribe(`/topic/conversations/${convId}`, (msg) => {
                // Update groups metadata (last message)
                setGroups(prev => {
                    const idx = prev.findIndex(g => g.id === convId);
                    if (idx === -1) return prev;

                    const updatedGroups = [...prev];
                    updatedGroups[idx] = {
                        ...updatedGroups[idx],
                        last_message: msg.content || (msg.type === 'IMAGE' ? 'Sent an image' : 'Sent a file'),
                        last_updated: msg.created_at,
                        last_sender: msg.sender_name || msg.sender
                    };

                    // Re-sort: newest message first
                    return updatedGroups.sort((a, b) => {
                        const timeA = new Date(a.last_updated || 0);
                        const timeB = new Date(b.last_updated || 0);
                        return timeB - timeA;
                    });
                });

                // If this message is for the currently selected group, add to messages
                if (selectedGroup && selectedGroup.id === convId) {
                    handleIncomingMessage(msg);
                } else {
                    // Otherwise increment unread count
                    setUnreadCounts((prev) => ({
                        ...prev,
                        [group.name]: (prev[group.name] || 0) + 1,
                    }));
                }
            });
        }).filter(unsub => unsub !== null);

        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [groups, selectedGroup, handleIncomingMessage]);

    // Select a group: load members and messages
    const selectGroup = useCallback(async (group) => {
        setSelectedGroup(group);
        setMessages([]);
        setHasMore(true);
        setError(null);

        // Clear unread for this group
        if (group?.name) {
            setUnreadCounts((prev) => ({ ...prev, [group.name]: 0 }));
        }

        // Load messages (initial)
        if (group.id) {
            fetchMessages(group.id, null);
        }

        // Load members
        if (group.id) {
            try {
                const memberData = await getGroupMembers(group.team_id);
                setMembers(Array.isArray(memberData) ? memberData : []);
            } catch (err) {
                console.error('Failed to load members', err);
                setMembers([]);
            }
        }
    }, []);

    // Send a message in the selected conversation
    const sendMessage = useCallback(
        async ({ content, file }) => {
            if (!selectedGroup) return;

            const payload = {
                content: content || '',
                conversationId: selectedGroup.id, // backend uses "conversationId"
                file: file || null,
            };

            try {
                const sent = await sendGroupMessage(payload);

                console.log('"Sending message response:', sent);
                // Add the sent message to local state immediately
                handleIncomingMessage(sent);
                return sent;
            } catch (err) {
                console.error('Failed to send message', err);
                setError('Failed to send message');
                throw err;
            }
        },
        [selectedGroup, handleIncomingMessage]
    );

    // Clear unread count for a specific group
    const clearUnread = useCallback((groupName) => {
        setUnreadCounts((prev) => ({ ...prev, [groupName]: 0 }));
    }, []);

    return (
        <GroupChatContext.Provider
            value={{
                groups,
                selectedGroup,
                messages,
                members,
                unreadCounts,
                loading,
                loadingMore,
                hasMore,
                error,
                selectGroup,
                sendMessage,
                loadMoreMessages,
                clearUnread,
            }}
        >
            {children}
        </GroupChatContext.Provider>
    );
};
