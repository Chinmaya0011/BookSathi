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

  async getQueueStatus(slug, date) {
    const res = await api.get(`/public/${slug}/queue-status`, { params: { date } });
    return res.data;
  },

  async joinQueue(slug, data) {
    const res = await api.post(`/public/${slug}/queue/join`, data);
    return res.data;
  },

  // Alias for backward compatibility
  async createAppointment(slug, data) {
    return this.bookAppointment(slug, data);
  },

  // Zero-login customer booking lookup by phone number
  async lookupByPhone(phone) {
    const res = await api.get('/public/lookup', { params: { phone } });
    return res.data;
  },

  // Email OTP pre-booking verification methods
  async sendEmailOtp(slug, { email, customerName }) {
    const res = await api.post(`/public/${slug}/send-email-otp`, { email, customerName });
    return res.data;
  },

  async verifyEmailOtp(slug, { email, otp }) {
    const res = await api.post(`/public/${slug}/verify-email-otp`, { email, otp });
    return res.data;
  },

  // 1-tap rebooking helper
  async getRebooking(phone) {
    const res = await api.get('/public/book-again', { params: { phone } });
    return res.data;
  },

  getIcsDownloadUrl(slug, appointmentCode) {
    const rawUrl = (process.env.API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
    const baseUrl = rawUrl.endsWith('/api') ? rawUrl.slice(0, -4) : rawUrl;
    return `${baseUrl}/api/public/${slug}/ics/${appointmentCode}`;
  },
};
