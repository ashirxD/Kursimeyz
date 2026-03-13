import { create } from "zustand";

interface SidebarState {
  // State
  isSidebarOpen: boolean;

  // Actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  // Initial state
  isSidebarOpen: false,

  // Actions
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  openSidebar: () => set({ isSidebarOpen: true }),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}));

// Selector hooks for better performance
export const useIsSidebarOpen = () =>
  useSidebarStore((state) => state.isSidebarOpen);
