import { create } from 'zustand';
import { qrBannerService } from '@/services/qrBanner.service';
import { dedupeQuery, invalidateQuery } from '@/lib/queryCache';

export const useQrBannerStore = create((set, get) => ({
  hasActivePurchase: false,
  order: null,
  loading: false,

  fetchMyOrder: async (force = false) => {
    const current = get().order;
    if (current && !force) {
      return { hasActivePurchase: get().hasActivePurchase, order: current };
    }

    try {
      const data = await dedupeQuery(
        'qr-banner:my-order',
        async () => {
          const res = await qrBannerService.getMyOrder();
          return res?.data || null;
        },
        { ttl: 300000, force } // 5 minute cache
      );

      if (data) {
        set({
          hasActivePurchase: Boolean(data.hasActivePurchase),
          order: data.order,
          loading: false,
        });
        return data;
      }
    } catch {
      set({ hasActivePurchase: false, order: null, loading: false });
    } finally {
      set({ loading: false });
    }
  },

  invalidateOrder: () => {
    invalidateQuery('qr-banner:my-order');
  },

  setOrderOptimistic: (order) => {
    invalidateQuery('qr-banner:my-order');
    set({
      hasActivePurchase: true,
      order,
      loading: false,
    });
  },
}));

