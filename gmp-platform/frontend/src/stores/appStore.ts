import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  breadcrumbs: { label: string; path: string }[];
  toggleSidebar: () => void;
  setBreadcrumbs: (items: { label: string; path: string }[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  breadcrumbs: [],
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setBreadcrumbs: (items) => set({ breadcrumbs: items }),
}));
