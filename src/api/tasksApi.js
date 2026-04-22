import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export const getTasks = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/task`, {
      headers: getAuthHeaders(),
      params: params,
    });

    // Fallback to specific endpoint
    if (response.data?.data?.content) return response.data.data.content;
    if (Array.isArray(response.data)) return response.data;
    return response.data?.data || [];
  } catch (error) {
    console.error('getTasks error', error);
    throw error.response?.data || error.message;
  }
};

export const getElasticSearchTasks = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/task/elastic-search`, {
      headers: getAuthHeaders(),
      params: params, // expects { keyword, status }
    });
    
    // Adjust based on the example response: { data: [...] }
    if (response.data?.data?.content) return response.data.data.content;
    if (Array.isArray(response.data)) return response.data;
    return response.data?.data || [];
  } catch (error) {
    console.error('getElasticSearchTasks error', error);
    throw error.response?.data || error.message;
  }
};

// getTaskById endpoint does not exist on Backend. Removed.

export const createTask = async (newTaskData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/task`, newTaskData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('createTask error', error);
    throw error.response?.data || error.message;
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    console.log("Update data:", updates);
    const response = await axios.patch(`${API_BASE_URL}/task/${taskId}`, updates, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('updateTask error', error);
    throw error.response?.data || error.message;
  }
};

export const addTaskOwner = async (addTaskOwnerData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/task/owner-adding`, addTaskOwnerData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('addTaskOwner error', error);
    throw error.response?.data || error.message;
  }
};

export default {
  getTasks,
  getElasticSearchTasks,
  createTask,
  updateTask,
  addTaskOwner,
};