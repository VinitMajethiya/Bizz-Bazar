import { create } from 'zustand';

export interface OrderModalData {
  isOpen: boolean;
  channel: 'whatsapp' | 'instagram';
  ref: string;
  message: string;
  targetUrl: string;
  isFromBag: boolean;
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
  isFromBag: false,
  openModal: (data) => set({ ...data, isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));

