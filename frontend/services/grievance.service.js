import api from './api';

export const grievanceService = {
  // Submit a new grievance (Public or Authenticated)
  async submitGrievance(data) {
    const res = await api.post('/grievances', data);
    return res.data;
  },

  // Get current logged-in professional's grievances
  async getMyGrievances() {
    const res = await api.get('/grievances/my');
    return res.data;
  },

  // Admin: Get all grievances with filters
  async getAllGrievances(params = {}) {
    const res = await api.get('/grievances/admin', { params });
    return res.data;
  },

  // Admin: Get grievance overview stats
  async getGrievanceStats() {
    const res = await api.get('/grievances/admin/stats');
    return res.data;
  },

  // Admin: Update status & admin resolution notes
  async updateGrievanceStatus(id, data) {
    const res = await api.patch(`/grievances/admin/${id}`, data);
    return res.data;
  },
};
