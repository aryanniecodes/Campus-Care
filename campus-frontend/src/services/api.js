import axios from 'axios';
import toast from 'react-hot-toast';

// ── Environment Configuration ───────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s timeout
});

// ── Request Interceptor: Auth & Headers ──────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Centralized Error Handling ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Ignore canceled requests (Axios CanceledError)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (response) {
      // Token expired or invalid
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
          toast.error("Session expired. Please login again.");
          window.location.href = '/';
        }
      }
      
      // Permission denied
      if (response.status === 403) {
        toast.error("Access denied. Insufficient permissions.");
      }

      // Backend error messages
      const message = response.data?.message || "Something went wrong";
      if (response.status >= 500) {
        console.error(`[SERVER ERROR] ${message}`);
      }
    } else {
      // Network error
      toast.error("Network error. Check your connection.");
    }

    return Promise.reject(error);
  }
);

export default api;
