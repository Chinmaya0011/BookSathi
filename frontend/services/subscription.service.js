import api from './api';

export const subscriptionService = {
  /**
   * Fetch all master pricing plans for onboarding and upgrades
   */
  async getPlans() {
    const res = await api.get('/subscriptions/plans');
    return res.data;
  },

  /**
   * Fetch current doctor's active subscription status & feature entitlements
   */
  async getMySubscription() {
    const res = await api.get('/subscriptions/my-subscription');
    return res.data;
  },

  /**
   * Select or upgrade plan during onboarding or settings
   */
  async selectPlan({ planKey, paymentMethod = 'FREE' }) {
    const res = await api.post('/subscriptions/select-plan', { planKey, paymentMethod });
    return res.data;
  },
};
