import { create } from 'zustand';
import { qrBannerService } from '@/services/qrBanner.service';

export const useQrBannerStore = create((set, get) => ({
  hasActivePurchase: false,
  order: null,
  loading: true,

  fetchMyOrder: async () => {
    try {
      const res = await qrBannerService.getMyOrder();
      if (res.data) {
        set({
          hasActivePurchase: res.data.hasActivePurchase,
          order: res.data.order,
          loading: false,
        });
        return res.data;
      }
    } catch {
      set({ hasActivePurchase: false, order: null, loading: false });
    }
  },

  setOrderOptimistic: (order) => {
    set({
      hasActivePurchase: true,
      order,
      loading: false,
    });
  },
}));
