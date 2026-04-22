import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export const getUnfinishedTasks = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/task/unfinished`, {
      headers: getAuthHeaders(),
    });

    return response.data?.data?.content || [];
  } catch (error) {
    console.error('getUnfinishedTasks error', error);
    throw error.response?.data || error.message;
  }
};

export const createTask = async (newTaskData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/task`, newTaskData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.log("create task error:", error);
    throw error.response?.data || error.message;
  }
}

export default {
  getUnfinishedTasks,
  createTask
};
