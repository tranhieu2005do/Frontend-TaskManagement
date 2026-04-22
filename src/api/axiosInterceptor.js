import axios from 'axios';
import { refreshAccessToken } from './authApi';

// A flag to prevent multiple token refresh requests at the same time
let isRefreshing = false;
// Queue to hold pending requests while the token is being refreshed
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};
axios.defaults.withCredentials = true;
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loops by not retrying login or refresh
    if (originalRequest.url.includes('/login') || originalRequest.url.includes('/refresh')) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue the request
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await refreshAccessToken();

        // Assuming response.data.access_token contains the new token 
        // depending on ApiResponse format: response.data.data.access_token
        const data = response?.data?.access_token ? response.data : response?.data?.data;
        const newAccessToken = data?.access_token || response?.access_token;

        if (!newAccessToken) {
          throw new Error('No access token returned from refresh endpoint');
        }

        sessionStorage.setItem('authToken', newAccessToken);

        // Update the header for the original failed request
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // If refresh fails, clear storage and logout
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('user_id');

        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
