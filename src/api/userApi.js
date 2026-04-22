import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/user`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export const changeUsername = async (newUsername) => {
  try {
    const response = await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/user`,
    null, 
    {
      params: {
        newUsername: newUsername,
      },
      
        headers: getAuthHeaders(),
      }
    );

    return response.data;
  } catch (error) {
    console.error('changeUsername error', error);
    throw error.response?.data || error.message;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}`, passwordData, {
      headers: getAuthHeaders(),
    });

    return response.data;
  } catch (error) {
    console.error('changePassword error', error);
    throw error.response?.data || error.message;
  }
};

export default {
  changeUsername,
  changePassword,
};
