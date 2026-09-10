import { create } from 'zustand';
import { professionalService } from '@/services/professional.service';

export const useSetupStatusStore = create((set) => ({
  setupStatus: null,
  loading: true,

  fetchSetupStatus: async () => {
    try {
      const res = await professionalService.getSetupStatus();
      if (res.data) {
        set({ setupStatus: res.data, loading: false });
        return res.data;
      }
    } catch {
      // Fallback gracefully if offline
    } finally {
      set({ loading: false });
    }
  },

  resetSetupStatus: () => set({ setupStatus: null, loading: true }),
}));
