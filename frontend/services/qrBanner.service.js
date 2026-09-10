import api from './api';

export const qrBannerService = {
  async getPlans() {
    const res = await api.get('/qr-banner/plans');
    return res.data;
  },

  async getMyOrder() {
    const res = await api.get('/qr-banner/my-order');
    return res.data;
  },

  async createOrder(data) {
    const res = await api.post('/qr-banner/create-order', data);
    return res.data;
  },

  async verifyPayment(orderId, paymentMethod = 'UPI') {
    const res = await api.post('/qr-banner/verify-payment', {
      orderId,
      paymentMethod,
    });
    return res.data;
  },
};
