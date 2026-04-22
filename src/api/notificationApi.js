import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1`;

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
  };
};

const normalize = (response) => {
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  if (data?.data) return data.data;
  return [];
};

export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notification`, {
      headers: getAuthHeaders(),
    });
    return normalize(response);
  } catch (error) {
    console.error('getNotifications error', error);
    throw error.response?.data || error.message;
  }
};

export const getUnreadCount = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notification/unread-count`, {
      headers: getAuthHeaders(),
    });
    console.log('Get unread-count notification: ', response);
    return response.data?.count ?? response.data ?? 0;
  } catch (error) {
    console.error('getUnreadCount error', error);
    throw error.response?.data || error.message;
  }
};

export const markNotificationRead = async (id) => {
  try {
    await axios.patch(`${API_BASE_URL}/notification/${id}/read`, {}, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error('markNotificationRead error', error);
    throw error.response?.data || error.message;
  }
};

export const markNotificationUnread = async (id) => {
  try {
    await axios.patch(`${API_BASE_URL}/notification/${id}/unread`, {}, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error('markNotificationUnread error', error);
    throw error.response?.data || error.message;
  }
};

export const markAllNotificationsRead = async () => {
  try {
    await axios.patch(`${API_BASE_URL}/notification/read-all`, {}, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    console.error('markAllNotificationsRead error', error);
    throw error.response?.data || error.message;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markNotificationUnread,
  markAllNotificationsRead,
};
