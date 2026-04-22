import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export const sendComment = async (commentData) => {
    try {
        console.log("Comment data request:", commentData);
        const response = await axios.post(`${API_BASE_URL}/comment`, commentData, {
            headers: getAuthHeaders()
        });
        console.log("Send Comment response:", response.data);
        return response.data;
    } catch (error) {
        console.log("Send comment error:", error);
        throw error.response?.data || error.message;
    }
};

export const getCommentInTask = async (taskId) => {
    try {
        console.log("Get comment for task id" + taskId + " :",taskId);
        const response = await axios.get(`${API_BASE_URL}/comment/task/${taskId}`,{
            headers: getAuthHeaders()
        });
        console.log("Get Comment response:", response.data.data);
        return response.data.data;
    } catch (error) {
        console.log("Get comment error", error);
        throw error.response?.data || error.message;
    }
}

export const deleteComment = async (commentId) => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/comment`, {
            params: { commentId },
            headers: getAuthHeaders()
        });
        return response.data;
    } catch (error) {
        console.error("Delete comment error", error);
        throw error.response?.data || error.message;
    }
};

export default {
    sendComment,
    getCommentInTask,
    deleteComment
}