import api from './api';

export const bookingLinkService = {
  async getDetails() {
    const res = await api.get('/booking-link');
    return res.data;
  },

  async checkSlug(slug) {
    const res = await api.get('/booking-link/check', { params: { slug } });
    return res.data;
  },

  async updateSlug(bookingSlug) {
    const res = await api.patch('/booking-link', { bookingSlug });
    return res.data;
  },
};

export const publicService = {
  async getProfessionals(params = {}) {
    const res = await api.get('/public/professionals', { params });
    return res.data;
  },

  async getProfile(slug) {
    const res = await api.get(`/public/${slug}`);
    return res.data;
  },

  // Alias for backward compatibility
  async getDoctorProfile(slug) {
    return this.getProfile(slug);
  },

  async getAvailability(slug, year, month) {
    const res = await api.get(`/public/${slug}/availability`, { params: { year, month } });
    return res.data;
  },

  async getSlots(slug, date, appointmentTypeId) {
    const res = await api.get(`/public/${slug}/slots`, {
      params: { date, appointmentTypeId },
    });
    return res.data;
  },

  // Alias for backward compatibility
  async getDoctorSlots(slug, date, appointmentTypeId) {
    return this.getSlots(slug, date, appointmentTypeId);
  },

  async holdSlot(slug, data) {
    const res = await api.post(`/public/${slug}/hold`, data);
    return res.data;
  },

  async releaseHold(slug, holdToken) {
    const res = await api.post(`/public/${slug}/hold/release`, { holdToken });
    return res.data;
  },

  async bookAppointment(slug, data) {
    const res = await api.post(`/public/${slug}/book`, data);
    return res.data;
  },

  // Alias for backward compatibility
  async createAppointment(slug, data) {
    return this.bookAppointment(slug, data);
  },

  getIcsDownloadUrl(slug, appointmentCode) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return `${baseUrl}/api/public/${slug}/ics/${appointmentCode}`;
  },
};

