import api from './api';

export const appointmentTypeService = {
  async getAppointmentTypes() {
    const res = await api.get('/appointment-types');
    return res.data;
  },

  async createAppointmentType(data) {
    const res = await api.post('/appointment-types', data);
    return res.data;
  },

  async updateAppointmentType(id, data) {
    const res = await api.put(`/appointment-types/${id}`, data);
    return res.data;
  },

  async deleteAppointmentType(id) {
    const res = await api.delete(`/appointment-types/${id}`);
    return res.data;
  },
};
