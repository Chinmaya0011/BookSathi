import api from './api';

export const adminService = {
  // Command center KPIs & system overview
  async getOverview() {
    const res = await api.get('/admin/overview');
    return res.data;
  },

  // Professional directory
  async getProfessionals(params = {}) {
    const res = await api.get('/admin/professionals', { params });
    return res.data;
  },

  async updateProfessional(id, data) {
    const res = await api.patch(`/admin/professionals/${id}`, data);
    return res.data;
  },

  // Global appointments
  async getAppointments(params = {}) {
    const res = await api.get('/admin/appointments', { params });
    return res.data;
  },

  async updateAppointmentStatus(id, data) {
    const res = await api.patch(`/admin/appointments/${id}/status`, data);
    return res.data;
  },

  // Global payments
  async getPayments(params = {}) {
    const res = await api.get('/admin/payments', { params });
    return res.data;
  },

  // Users & RBAC
  async getUsers(params = {}) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUser(id, data) {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  },

  // QR Standee & Banner Physical Kit Orders
  async getQrOrders(params = {}) {
    const res = await api.get('/admin/orders', { params });
    return res.data;
  },

  async updateQrOrderStatus(id, data) {
    const res = await api.patch(`/admin/orders/${id}`, data);
    return res.data;
  },

  // Subscriptions & Plans
  async getSubscriptions(params = {}) {
    const res = await api.get('/admin/subscriptions', { params });
    return res.data;
  },

  async updatePricingPlan(id, data) {
    const res = await api.patch(`/admin/plans/${id}`, data);
    return res.data;
  },

  // Support & Grievances
  async getGrievances(params = {}) {
    const res = await api.get('/admin/grievances', { params });
    return res.data;
  },

  async updateGrievance(id, data) {
    const res = await api.patch(`/admin/grievances/${id}`, data);
    return res.data;
  },

  // Platform Settings & Feature Flags
  async getSettings() {
    const res = await api.get('/admin/settings');
    return res.data;
  },

  async updateSettings(data) {
    const res = await api.patch('/admin/settings', data);
    return res.data;
  },

  // Audit logs
  async getAuditLogs(params = {}) {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },
};
