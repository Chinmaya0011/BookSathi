import axios from 'axios';

const rawApiUrl = (process.env.API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Response interceptor to handle unauthenticated 401s and revoked sessions gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const isSessionRevoked = error.response?.data?.code === 'SESSION_REVOKED';
      const errorMessage =
        error.response?.data?.message ||
        'Your account was signed in from another device or browser. For your security, this session has been logged out.';

      localStorage.removeItem('bs_token');
      localStorage.removeItem('bs_user');

      // Dispatch global session revoked event for modal notification
      window.dispatchEvent(
        new CustomEvent('booksaathi:session_revoked', {
          detail: {
            isRevoked: isSessionRevoked,
            message: errorMessage,
          },
        })
      );

      // If on protected dashboard/admin/onboarding routes and not already on /login, redirect
      const isProtectedRoute =
        window.location.pathname.startsWith('/dashboard') ||
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/onboarding');

      if (isProtectedRoute && !window.location.pathname.startsWith('/login') && !isSessionRevoked) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
