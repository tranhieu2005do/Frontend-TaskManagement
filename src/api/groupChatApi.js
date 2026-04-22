import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    return {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
    };
};

/**
 * Fetch all teams (groups) the current user belongs to.
 * Each team has a linked conversation for group chat.
 */
export const getGroupConversations = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/conversation/user/${userId}`, {
            headers: getAuthHeaders(),
        });
        return response.data.data;
    } catch (error) {
        console.error('getGroupConversations error', error);
        throw error.response?.data || error.message;
    }
};

/**
 * Fetch members of a specific team/group.
 */
export const getGroupMembers = async (teamId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/team/${teamId}/members`, {
            headers: getAuthHeaders(),
        });
        return response.data?.data || [];
    } catch (error) {
        console.error('getGroupMembers error', error);
        throw error.response?.data || error.message;
    }
};

/**
 * Send a message to a conversation.
 * @param {Object} messageData - { content, conversationId, file? }
 */
export const sendGroupMessage = async (messageData) => {
    try {
        const formData = new FormData();
        formData.append('content', messageData.content);
        formData.append('conversationId', messageData.conversationId);
        if (messageData.file) {
            formData.append('file', messageData.file);
        }

        const token = sessionStorage.getItem('authToken');
        const headers = {
            Authorization: token ? `Bearer ${token}` : undefined,
            // Axios automatically sets 'Content-Type': 'multipart/form-data' along with the required boundary if we don't set 'Content-Type' explicitly
        };

        const response = await axios.post(`${API_BASE_URL}/message`, formData, {
            headers,
        });
        return response.data?.data || response.data;
    } catch (error) {
        console.error('sendGroupMessage error', error);
        throw error.response?.data || error.message;
    }
};

/**
 * Fetch messages for a specific conversation with cursor-based pagination.
 * @param {number} conversationId - The ID of the conversation
 * @param {number|null} cursorId - The ID of the last message (for older messages)
 */
export const getConversationMessages = async (conversationId, cursorId = null) => {
    try {
        const url = cursorId
            ? `${API_BASE_URL}/message/conversation/${conversationId}?cursorId=${cursorId}`
            : `${API_BASE_URL}/message/conversation/${conversationId}`;

        const response = await axios.get(url, {
            headers: getAuthHeaders(),
        });
        return response.data; // { statusCode, message, data: [MessageResponse] }
    } catch (error) {
        console.error('getConversationMessages error', error);
        throw error.response?.data || error.message;
    }
};

export default {
    getGroupConversations,
    getGroupMembers,
    sendGroupMessage,
    getConversationMessages,
};
