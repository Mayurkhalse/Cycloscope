import { create } from 'zustand';

export const useUIStore = create((set) => ({
  selectedCycloneId: 'IO_2026_03',
  setSelectedCycloneId: (id) => set({ selectedCycloneId: id }),

  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),

  isChatOpen: false,
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),
  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),

  disclaimerDismissedSession: false,
  dismissDisclaimer: () => set({ disclaimerDismissedSession: true }),

  mapViewport: {
    center: [15.0, 78.0], // Center over North Indian Ocean
    zoom: 5,
  },
  setMapViewport: (center, zoom) => set({ mapViewport: { center, zoom } }),

  systemMode: 'live', // 'live' | 'replay'
  setSystemMode: (mode) => set({ systemMode: mode }),

  historicalFilters: {
    yearRange: [2015, 2026],
    basin: 'All',
    category: 'All',
    query: '',
  },
  setHistoricalFilters: (newFilters) =>
    set((state) => ({
      historicalFilters: { ...state.historicalFilters, ...newFilters },
    })),
}));

