import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('[axiosClient] Backend API unreachable or error response. Utilizing client fallback mock fixtures:', error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
