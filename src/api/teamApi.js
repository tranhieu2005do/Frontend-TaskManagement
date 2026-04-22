import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export const getTeams = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/team`, {
      headers: getAuthHeaders(),
    });

    return response.data?.data?.content || [];
  } catch (error) {
    console.error('getTeams error', error);
    throw error.response?.data || error.message;
  }
};

export const getTeamMembers = async (teamId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/team/${teamId}/members`,{
      headers: getAuthHeaders(),
    })
    return response.data.data;
  } catch(error){
    console.error('getTeamMembers error', error);
    throw error.response?.data || error.message;
  }
}

export const getTeamTasks = async (teamId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/team/${teamId}/tasks`,{
      headers: getAuthHeaders(),
    })
    return response.data.data;
  } catch (error){
    console.error('getTeamTasks error', error);
    throw error.response?.data || error.message;
  }
}

export const createTeam = async (teamData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/team`, teamData, {
      headers: getAuthHeaders(),
    });
    return response.data?.data || response.data;
  } catch (error) {
    console.error('createTeam error', error);
    throw error.response?.data || error.message;
  }
};

export default {
  getTeams,
  getTeamMembers,
  getTeamTasks,
  createTeam,
};

