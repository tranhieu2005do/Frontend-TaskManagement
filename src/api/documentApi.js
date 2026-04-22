import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export const getDocumentByTaskId = async (taskId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/document`, {
      headers: getAuthHeaders(),
      params: { taskId },
    });
    console.log("Document response: ", response);
    return response.data;
  } catch (error) {
    console.error('getDocument error', error);
    throw error.response?.data || error.message;
  }
};

export const updateDocument = async (documentId, content) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/document/${documentId}`,
      { content },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('updateDocument error', error);
    throw error.response?.data || error.message;
  }
};

export default {
  getDocumentByTaskId,
  updateDocument,
};
