import api from './api';

export const userAppointmentService = {
  async bookAppointment(data) {
    const res = await api.post('/user-appointments', data);
    return res.data;
  },

  async getMyAppointments(params = {}) {
    const res = await api.get('/user-appointments/my', { params });
    return res.data;
  },

  async cancelAppointment(id, reason) {
    const res = await api.patch(`/user-appointments/${id}/cancel`, { reason });
    return res.data;
  },

  async requestReschedule(id, { requestedDate, requestedTime, reason }) {
    const res = await api.patch(`/user-appointments/${id}/reschedule-request`, {
      requestedDate,
      requestedTime,
      reason,
    });
    return res.data;
  },
};

export const notificationService = {
  async getNotifications() {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id) {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
};
