import api from './api';

export const appointmentService = {
  async getAppointments(params = {}) {
    const res = await api.get('/appointments', { params });
    return res.data;
  },

  async getAppointmentById(id) {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  async confirmAppointment(id) {
    const res = await api.patch(`/appointments/${id}/confirm`);
    return res.data;
  },

  async rejectAppointment(id, reason = '') {
    const res = await api.patch(`/appointments/${id}/reject`, { reason });
    return res.data;
  },

  async cancelAppointment(id, reason = '') {
    const res = await api.patch(`/appointments/${id}/cancel`, { reason });
    return res.data;
  },

  async completeAppointment(id) {
    const res = await api.patch(`/appointments/${id}/complete`);
    return res.data;
  },

  async updateStatus(id, status, cancelReason = '') {
    const res = await api.patch(`/appointments/${id}/status`, { status, cancelReason });
    return res.data;
  },

  async updateNotes(id, notes) {
    const res = await api.patch(`/appointments/${id}/notes`, { notes });
    return res.data;
  },

  async createManualBooking(data) {
    const res = await api.post('/appointments/manual', data);
    return res.data;
  },

  async callNextQueue(data = {}) {
    const res = await api.post('/appointments/queue/call-next', data);
    return res.data;
  },

  async rescheduleAppointment(id, data) {
    const res = await api.patch(`/appointments/${id}/reschedule`, data);
    return res.data;
  },
};
