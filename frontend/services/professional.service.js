import api from './api';

export const professionalService = {
  async getProfile() {
    const res = await api.get('/professional/profile');
    return res.data;
  },

  async updateProfile(data) {
    const res = await api.put('/professional/profile', data);
    return res.data;
  },

  async getStats() {
    const res = await api.get('/professional/stats');
    return res.data;
  },

  async getSetupStatus() {
    const res = await api.get('/professional/setup-status');
    return res.data;
  },

  async checkModeSwitch(targetMode) {
    const res = await api.get('/professional/switch-check', { params: { targetMode } });
    return res.data;
  },
};
