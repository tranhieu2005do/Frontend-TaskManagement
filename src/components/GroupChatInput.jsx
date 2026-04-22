import React, { useContext, useState, useRef } from 'react';
import { GroupChatContext } from '../context/GroupChatContext';

/**
 * Message composer with text input, file/image attachment, and send button.
 * Supports Enter to send, Shift+Enter for newline.
 */
const GroupChatInput = () => {
    const { selectedGroup, sendMessage } = useContext(GroupChatContext);
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [sending, setSending] = useState(false);
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);

    if (!selectedGroup) return null;

    /**
     * Handle file selection from the file input.
     */
    const handleFileChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) {
            setFile(selected);
        }
    };

    /**
     * Remove the attached file.
     */
    const clearFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Send the message (text and/or file).
     */
    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed && !file) return;

        setSending(true);
        try {
            await sendMessage({
                content: trimmed,
                file,
            });

            // Clear inputs after successful send
            setText('');
            clearFile();
            textareaRef.current?.focus();
        } catch (err) {
            console.error('Send failed', err);
        } finally {
            setSending(false);
        }
    };

    /**
     * Handle keyboard shortcuts in the textarea.
     */
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /**
     * Determine file type icon.
     */
    const getFileIcon = () => {
        if (!file) return '📎';
        const ext = file.name.split('.').pop()?.toLowerCase();
        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
        return imageExts.includes(ext) ? '🖼️' : '📄';
    };

    /**
     * Format file size for preview.
     */
    const formatSize = (bytes) => {
        if (!bytes) return '';
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="gc-input-area">
            {/* File preview */}
            {file && (
                <div className="gc-file-preview">
                    <span className="gc-file-preview-icon">{getFileIcon()}</span>
                    <span className="gc-file-preview-name">{file.name}</span>
                    <span className="gc-file-preview-size">{formatSize(file.size)}</span>
                    <button className="gc-file-preview-remove" onClick={clearFile}>
                        ✕
                    </button>
                </div>
            )}

            {/* Input row */}
            <div className="gc-input-row">
                {/* File attach button */}
                <button
                    className="gc-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                    disabled={sending}
                >
                    📎
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="gc-file-input-hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                />

                {/* Text input */}
                <textarea
                    ref={textareaRef}
                    className="gc-text-input"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={sending}
                />

                {/* Send button */}
                <button
                    className="gc-send-btn"
                    onClick={handleSend}
                    disabled={sending || (!text.trim() && !file)}
                    title="Send message"
                >
                    {sending ? (
                        <span className="gc-send-spinner" />
                    ) : (
                        '➤'
                    )}
                </button>
            </div>
        </div>
    );
};

export default GroupChatInput;
