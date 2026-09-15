import { create } from 'zustand';
import { professionalService } from '@/services/professional.service';
import { dedupeQuery, invalidateQuery } from '@/lib/queryCache';

export const useSetupStatusStore = create((set, get) => ({
  setupStatus: null,
  loading: false,

  fetchSetupStatus: async (force = false) => {
    // If we already have setup status in state and not forcing, return it immediately
    const current = get().setupStatus;
    if (current && !force) {
      return current;
    }

    try {
      const data = await dedupeQuery(
        'professional:setup-status',
        async () => {
          const res = await professionalService.getSetupStatus();
          return res?.data || null;
        },
        { ttl: 180000, force } // 3 minute cache
      );

      if (data) {
        set({ setupStatus: data, loading: false });
        return data;
      }
    } catch {
      // Fallback gracefully
    } finally {
      set({ loading: false });
    }
  },

  invalidateSetupStatus: () => {
    invalidateQuery('professional:setup-status');
  },

  resetSetupStatus: () => {
    invalidateQuery('professional:setup-status');
    set({ setupStatus: null, loading: false });
  },
}));

