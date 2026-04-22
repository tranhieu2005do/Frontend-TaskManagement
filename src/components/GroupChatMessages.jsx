import React, { useContext, useEffect, useRef } from 'react';
import { GroupChatContext } from '../context/GroupChatContext';

/**
 * Displays messages for the currently selected group conversation.
 * Supports TEXT, IMAGE, and FILE message types.
 * Auto-scrolls to the latest message.
 */
const GroupChatMessages = () => {
    const {
        messages,
        selectedGroup,
        loading,
        loadingMore,
        hasMore,
        loadMoreMessages
    } = useContext(GroupChatContext);

    const bottomRef = useRef(null);
    const sentinelRef = useRef(null);
    const containerRef = useRef(null);
    const prevMessagesLengthRef = useRef(0);

    const getUsername = () => {
        const stored = sessionStorage.getItem('username');
        if (!stored) return '';
        // Handle potentially quoted strings from previous bug
        try {
            return JSON.parse(stored);
        } catch {
            return stored;
        }
    };

    const currentUser = getUsername() || sessionStorage.getItem('email') || '';

    // Intersection Observer for "Load More"
    useEffect(() => {
        if (!hasMore || loadingMore || !selectedGroup) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreMessages();
                }
            },
            { threshold: 1.0, root: containerRef.current }
        );

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMore, selectedGroup, loadMoreMessages]);

    // Perfect Scroll Anchoring for prepending
    const lastScrollTopRef = useRef(0);
    const lastScrollHeightRef = useRef(0);

    const handleScroll = () => {
        if (containerRef.current) {
            lastScrollTopRef.current = containerRef.current.scrollTop;
            lastScrollHeightRef.current = containerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const currentLength = messages.length;
        const prevLength = prevMessagesLengthRef.current;

        // Scenario 1: Initial load OR selection change
        if (prevLength === 0 && currentLength > 0) {
            container.scrollTop = container.scrollHeight;
        }
        // Scenario 2: Prepend (pagination)
        else if (currentLength > prevLength && messages[0]?.id !== prevMessagesLengthRef.current_first_id) {
            // Stay at the same relative position
            const newHeight = container.scrollHeight;
            const diff = newHeight - lastScrollHeightRef.current;
            container.scrollTop = lastScrollTopRef.current + diff;
        }
        // Scenario 3: Append (new message)
        else if (currentLength > prevLength) {
            // Scroll to bottom only if we were already close to the bottom
            const isNearBottom = container.scrollHeight - container.clientHeight - container.scrollTop < 100;
            if (isMine(messages[currentLength - 1]) || isNearBottom) {
                container.scrollTop = container.scrollHeight;
            }
        }

        prevMessagesLengthRef.current = currentLength;
        prevMessagesLengthRef.current_first_id = messages[0]?.id;
        lastScrollHeightRef.current = container.scrollHeight;
        lastScrollTopRef.current = container.scrollTop;
    }, [messages]);

    const isMine = (msg) => {
        if (!msg) return false;
        return (
            msg.sender &&
            (msg.sender === currentUser ||
                msg.sender === sessionStorage.getItem('email'))
        );
    };

    // Empty state when no group is selected
    if (!selectedGroup) {
        return (
            <div className="gc-messages gc-messages--empty">
                <div className="gc-empty-state">
                    <div className="gc-empty-icon">💬</div>
                    <h3>Select a conversation</h3>
                    <p>Choose a group from the sidebar to start chatting</p>
                </div>
            </div>
        );
    }

    /**
     * Format a timestamp for display.
     */
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            if (isToday) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            return date.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return '';
        }
    };

    /**
     * Format file size for display.
     */
    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    /**
     * Render message content based on type.
     */
    const renderContent = (msg) => {
        switch (msg.type) {
            case 'IMAGE':
                return (
                    <div className="gc-msg-image-wrap">
                        <img
                            src={msg.url}
                            alt={msg.file_name || 'Image'}
                            className="gc-msg-image"
                            loading="lazy"
                        />
                        {msg.content && <p className="gc-msg-text">{msg.content}</p>}
                    </div>
                );
            case 'FILE':
                return (
                    <div className="gc-msg-file">
                        <a
                            href={msg.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="gc-file-link"
                        >
                            <span className="gc-file-icon">📎</span>
                            <span className="gc-file-info">
                                <span className="gc-file-name">{msg.file_name || 'Download file'}</span>
                                {msg.file_size && (
                                    <span className="gc-file-size">{formatFileSize(msg.file_size)}</span>
                                )}
                            </span>
                        </a>
                        {msg.content && <p className="gc-msg-text">{msg.content}</p>}
                    </div>
                );
            default: // TEXT
                return <p className="gc-msg-text">{msg.content}</p>;
        }
    };

    return (
        <div className="gc-messages">
            {/* Header */}
            <div className="gc-messages-header">
                <div className="gc-messages-header-info">
                    <h3 className="gc-messages-title">{selectedGroup.team_name}</h3>
                    <span className="gc-messages-subtitle">
                        {selectedGroup.number_of_members || 0} members
                    </span>
                </div>
            </div>

            {/* Message List */}
            <div
                className="gc-messages-body"
                ref={containerRef}
                onScroll={handleScroll}
            >
                {/* Sentinel for infinite scroll */}
                {hasMore && (
                    <div ref={sentinelRef} className="gc-pagination-sentinel">
                        {loadingMore && (
                            <div className="gc-loading-more">
                                <div className="gc-spinner-small"></div>
                                <span>Loading older messages...</span>
                            </div>
                        )}
                    </div>
                )}

                {messages.length === 0 && !loading && (
                    <div className="gc-no-messages">
                        <p>No messages yet. Start the conversation! 🎉</p>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMine =
                        msg.sender &&
                        (msg.sender === currentUser ||
                            msg.sender === sessionStorage.getItem('email'));

                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const isFirstInSequence = !prevMsg || prevMsg.sender !== msg.sender;

                    return (
                        <div
                            key={msg.id || `msg-${index}`}
                            className={`gc-msg ${isMine ? 'gc-msg--mine' : 'gc-msg--other'} ${isFirstInSequence ? 'gc-msg--first' : 'gc-msg--follow'}`}
                        >
                            {/* Avatar ONLY for other users and ONLY for the first message in a sequence */}
                            {!isMine && (
                                <div className="gc-msg-avatar-wrapper">
                                    {isFirstInSequence ? (
                                        <div className="gc-msg-avatar" title={msg.sender}>
                                            {(msg.sender || '?')[0].toUpperCase()}
                                        </div>
                                    ) : (
                                        <div className="gc-msg-avatar-spacer" />
                                    )}
                                </div>
                            )}

                            <div className="gc-msg-bubble-container">
                                <div className="gc-msg-bubble">
                                    {/* Sender name for others - first message in sequence only */}
                                    {!isMine && isFirstInSequence && (
                                        <span className="gc-msg-sender">{msg.sender}</span>
                                    )}

                                    {/* Content */}
                                    {renderContent(msg)}

                                    {/* Timestamp */}
                                    <span className="gc-msg-time">{formatTime(msg.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};

export default GroupChatMessages;
