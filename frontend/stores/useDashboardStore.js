import { create } from 'zustand';

export const useDashboardStore = create((set) => ({
  mobileSidebarOpen: false,
  manualBookingModalOpen: false,
  activeDateFilter: null,

  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ mobileSidebarOpen: !state.mobileSidebarOpen })),
  setManualBookingModalOpen: (open) => set({ manualBookingModalOpen: open }),
  setActiveDateFilter: (date) => set({ activeDateFilter: date }),
}));
