import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('bs_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // If unauthorized on protected routes, redirect to login
      if (
        window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/onboarding')
      ) {
        localStorage.removeItem('bs_token');
        localStorage.removeItem('bs_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
