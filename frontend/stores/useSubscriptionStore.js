import { create } from 'zustand';
import { subscriptionService } from '@/services/subscription.service';

export const useSubscriptionStore = create((set, get) => ({
  plans: [],
  currentSubscription: null,
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await subscriptionService.getPlans();
      if (res?.success && res?.data) {
        set({ plans: res.data, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchMySubscription: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await subscriptionService.getMySubscription();
      if (res?.success && res?.data) {
        set({ currentSubscription: res.data, isLoading: false });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  selectPlan: async ({ planKey, paymentMethod = 'FREE' }) => {
    set({ isLoading: true, error: null });
    try {
      const res = await subscriptionService.selectPlan({ planKey, paymentMethod });
      if (res?.success && res?.data) {
        set({ currentSubscription: res.data, isLoading: false });
        return res.data;
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },
}));
