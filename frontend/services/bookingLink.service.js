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
