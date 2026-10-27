import { create } from 'zustand';

export interface ToastState {
  message: string | null;
  type: 'info' | 'error' | 'success';
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  showToast: (message, type = 'info') => set({ message, type }),
  hideToast: () => set({ message: null }),
}));
