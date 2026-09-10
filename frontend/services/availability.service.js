import api from './api';

export const availabilityService = {
  async getWeeklyAvailability() {
    const res = await api.get('/availability');
    return res.data;
  },

  async updateWeeklyAvailability(availability) {
    const res = await api.put('/availability', { availability });
    return res.data;
  },

  async copyMondaySchedule() {
    const res = await api.post('/availability/copy-monday');
    return res.data;
  },
};

export const blockedDateService = {
  async getBlockedDates() {
    const res = await api.get('/blocked-dates');
    return res.data;
  },

  async createBlockedDate(data) {
    const res = await api.post('/blocked-dates', data);
    return res.data;
  },

  async deleteBlockedDate(id) {
    const res = await api.delete(`/blocked-dates/${id}`);
    return res.data;
  },
};
