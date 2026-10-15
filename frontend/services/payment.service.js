import api from './api';

export const paymentService = {
  // Public checkout: create payment order
  async createOrder(data) {
    const res = await api.post('/payments/create-order', data);
    return res.data;
  },

  // Public checkout: check order / payment status from backend
  async getOrderStatus(orderId) {
    const res = await api.get(`/payments/${orderId}/status`);
    return res.data;
  },

  // Public checkout: verify & confirm payment
  async verifyPayment(data) {
    const res = await api.post('/payments/verify', data);
    return res.data;
  },

  // Public / Doctor: get invoice data
  async getInvoice(paymentId, params = {}) {
    const res = await api.get(`/payments/${paymentId}/invoice`, { params });
    return res.data;
  },

  // Doctor Dashboard: list payments with filters
  async getPayments(params = {}) {
    const res = await api.get('/payments', { params });
    return res.data;
  },

  // Doctor Dashboard: financial stats & analytics
  async getStats() {
    const res = await api.get('/payments/stats');
    return res.data;
  },

  // Doctor Dashboard: record offline cash/UPI payment
  async recordManualPayment(data) {
    const res = await api.post('/payments/record-manual', data);
    return res.data;
  },

  // Doctor Dashboard: issue refund (by orderId or paymentId)
  async processRefund(paymentOrOrderId, data) {
    const res = await api.post(`/payments/${paymentOrOrderId}/refund`, data);
    return res.data;
  },

  // Webhook / Sandbox simulation
  async simulateWebhook(event, payload) {
    const res = await api.post('/payments/webhook/simulate', { event, payload });
    return res.data;
  },
};
