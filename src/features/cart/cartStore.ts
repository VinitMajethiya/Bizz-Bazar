import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartOptions {
  material?: string;
  size?: string;
}

export interface CartLine {
  productId: string;
  options: CartOptions;
  qty: number;
}

export interface CartState {
  lines: CartLine[];
  note: string;
  isOpen: boolean;
  addLine: (
    line: { productId: string; options?: CartOptions; qty?: number },
    stockQty?: number | null
  ) => void;
  updateQty: (index: number, qty: number, stockQty?: number | null) => void;
  removeLine: (index: number) => void;
  setNote: (note: string) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export function areOptionsEqual(a?: CartOptions, b?: CartOptions): boolean {
  const matA = a?.material || '';
  const matB = b?.material || '';
  const sizeA = a?.size || '';
  const sizeB = b?.size || '';
  return matA === matB && sizeA === sizeB;
}

export function clampQty(qty: number, stockQty?: number | null): number {
  const max = typeof stockQty === 'number' && stockQty > 0 ? Math.min(10, stockQty) : 10;
  return Math.max(1, Math.min(max, qty));
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      note: '',
      isOpen: false,

      addLine: (line, stockQty) => {
        set((state) => {
          const addQty = line.qty ?? 1;
          const options = line.options || {};
          const existingIndex = state.lines.findIndex(
            (l) => l.productId === line.productId && areOptionsEqual(l.options, options)
          );

          if (existingIndex > -1) {
            const nextLines = [...state.lines];
            const currentLine = nextLines[existingIndex];
            const newQty = clampQty(currentLine.qty + addQty, stockQty);
            nextLines[existingIndex] = { ...currentLine, qty: newQty };
            return { lines: nextLines };
          }

          const newLine: CartLine = {
            productId: line.productId,
            options,
            qty: clampQty(addQty, stockQty),
          };

          return { lines: [...state.lines, newLine] };
        });
      },

      updateQty: (index, qty, stockQty) => {
        set((state) => {
          if (index < 0 || index >= state.lines.length) return state;

          if (qty <= 0) {
            const nextLines = state.lines.filter((_, i) => i !== index);
            return { lines: nextLines };
          }

          const nextLines = [...state.lines];
          nextLines[index] = {
            ...nextLines[index],
            qty: clampQty(qty, stockQty),
          };
          return { lines: nextLines };
        });
      },

      removeLine: (index) => {
        set((state) => ({
          lines: state.lines.filter((_, i) => i !== index),
        }));
      },

      setNote: (note) => set({ note }),

      clearCart: () => set({ lines: [], note: '' }),

      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'byraya-bag',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines, note: state.note }),
    }
  )
);

// Cross-tab sync via window storage event
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'byraya-bag') {
      useCartStore.persist.rehydrate();
    }
  });
}

