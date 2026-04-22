import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

export const addMemberToTeam = async (teamId, email) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/team-member`,
      null, 
      {
        params: {
          teamId: teamId,
          email: email
        },
        headers: getAuthHeaders()
      }
    );

    return response.data;
  } catch (error) {
    console.log('add member to team error:', error);
    throw error.response?.data || error.message;
  }
};

export const removeMemberFromTeam = async (teamId, email) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/team-member`,
      null,
      {
        params: {
          teamId: teamId,
          email: email
        },
        headers: getAuthHeaders()
      }
    );
    return response.data;
  } catch (error) {
    console.error('remove member from team error:', error);
    throw error.response?.data || error.message;
  }
};

export default {
    addMemberToTeam,
    removeMemberFromTeam
}