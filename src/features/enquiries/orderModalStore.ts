import { create } from 'zustand';

export interface OrderModalData {
  isOpen: boolean;
  channel: 'whatsapp' | 'instagram';
  ref: string;
  message: string;
  targetUrl: string;
  isBagCheckout: boolean;
}

interface OrderModalStore extends OrderModalData {
  openModal: (data: Omit<OrderModalData, 'isOpen'>) => void;
  closeModal: () => void;
}

export const useOrderModalStore = create<OrderModalStore>((set) => ({
  isOpen: false,
  channel: 'instagram',
  ref: '',
  message: '',
  targetUrl: '',
  isBagCheckout: false,
  openModal: (data) => set({ ...data, isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

