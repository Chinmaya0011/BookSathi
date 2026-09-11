import api from './api';

export const subscriptionService = {
  /**
   * Fetch Free and Pro pricing plans
   */
  async getPlans() {
    const res = await api.get('/subscriptions/plans');
    return res.data;
  },

  /**
   * Fetch current professional's active plan status
   */
  async getMySubscription() {
    const res = await api.get('/subscriptions/my-subscription');
    return res.data;
  },

  /**
   * Upgrade to Pro plan
   */
  async upgradeToPro(billingCycle = 'MONTHLY') {
    const res = await api.post('/subscriptions/select-plan', {
      planKey: 'PRO',
      billingCycle,
    });
    return res.data;
  },

  async selectPlan({ planKey = 'PRO', billingCycle = 'MONTHLY' }) {
    const res = await api.post('/subscriptions/select-plan', { planKey, billingCycle });
    return res.data;
  },
};
