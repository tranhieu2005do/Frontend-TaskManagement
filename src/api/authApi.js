import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || ''}/api/v1/auth`;

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable automatic cookie handling
});

// Set global axios default for other direct axios calls
axios.defaults.withCredentials = true;

export const login = async (credentials) => {
  try {
    const response = await authApi.post('/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const register = async (userData) => {
  try {
    const response = await authApi.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginWithGoogle = async (code, redirectUri) => {
  try {
    const response = await authApi.post('/google', { code, redirect_uri: redirectUri });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const loginWithFacebook = async (code, redirectUri) => {
  try {
    const response = await authApi.post('/facebook', { code, redirect_uri: redirectUri });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const refreshAccessToken = async () => {
  try {
    const response = await authApi.post('/refresh');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const logoutUser = async () => {
  try {
    const response = await authApi.post('/logout');
    console.log("Logout response: ", response);

    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user_id');

    window.location.href = '/login';
    return response.data;
  } catch (error) {
    console.log("Error logout: ", error);
    // Force logout on client even if server fails
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('user_id');

    window.location.href = '/login';
    throw error.response?.data || error.message;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await authApi.post('/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    const response = await authApi.post('/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resetPassword = async (email, reset_token, new_password) => {
  try {
    const response = await authApi.post('/reset-password', {
      email,
      reset_token,
      new_password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const verifyAccount = async (token) => {
  try {
    const response = await authApi.post(`/verify?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await authApi.post(`/resend-verification?email=${email}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default authApi;
