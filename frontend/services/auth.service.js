import api from './api';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    if (res.data?.data?.token) {
      localStorage.setItem('bs_token', res.data.data.token);
      localStorage.setItem('bs_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.data?.token) {
      localStorage.setItem('bs_token', res.data.data.token);
      localStorage.setItem('bs_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  logout() {
    localStorage.removeItem('bs_token');
    localStorage.removeItem('bs_user');
  },

  async forgotPassword(email) {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(token, password) {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.patch('/auth/profile', data);
    return res.data;
  },

  async changePassword(currentPassword, newPassword) {
    const res = await api.patch('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },

  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('bs_token');
  },
};
