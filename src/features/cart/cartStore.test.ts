import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('Cart Store', () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clearCart();
    useCartStore.setState({ isOpen: false });
  });

  it('starts with empty bag', () => {
    const state = useCartStore.getState();
    expect(state.lines).toEqual([]);
    expect(state.note).toBe('');
    expect(state.isOpen).toBe(false);
  });

  it('adds a line to bag', () => {
    useCartStore.getState().addLine({
      productId: 'p-1',
      options: { material: 'Gold' },
      qty: 1,
    });

    const state = useCartStore.getState();
    expect(state.lines).toHaveLength(1);
    expect(state.lines[0]).toEqual({
      productId: 'p-1',
      options: { material: 'Gold' },
      qty: 1,
    });
  });

  it('merges identical product and option', () => {
    useCartStore.getState().addLine({
      productId: 'p-1',
      options: { material: 'Gold' },
      qty: 2,
    });

    useCartStore.getState().addLine({
      productId: 'p-1',
      options: { material: 'Gold' },
      qty: 3,
    });

    const state = useCartStore.getState();
    expect(state.lines).toHaveLength(1);
    expect(state.lines[0].qty).toBe(5);
  });

  it('treats different options as separate lines', () => {
    useCartStore.getState().addLine({
      productId: 'p-1',
      options: { material: 'Gold' },
      qty: 1,
    });

    useCartStore.getState().addLine({
      productId: 'p-1',
      options: { material: 'Rose Gold' },
      qty: 1,
    });

    const state = useCartStore.getState();
    expect(state.lines).toHaveLength(2);
  });

  it('caps quantity to stock_qty or max 10', () => {
    // Stock is 4
    useCartStore.getState().addLine(
      {
        productId: 'p-1',
        options: { material: 'Gold' },
        qty: 12,
      },
      4
    );

    expect(useCartStore.getState().lines[0].qty).toBe(4);

    // Stock unconstrained caps at 10
    useCartStore.getState().addLine({
      productId: 'p-2',
      options: { material: 'Silver' },
      qty: 20,
    });

    expect(useCartStore.getState().lines[1].qty).toBe(10);
  });

  it('updates quantity and removes line when decremented to zero', () => {
    useCartStore.getState().addLine({
      productId: 'p-1',
      options: { material: 'Gold' },
      qty: 2,
    });

    // Update to 3
    useCartStore.getState().updateQty(0, 3);
    expect(useCartStore.getState().lines[0].qty).toBe(3);

    // Decrement to 0 removes line
    useCartStore.getState().updateQty(0, 0);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it('removes a line directly', () => {
    useCartStore.getState().addLine({ productId: 'p-1', qty: 1 });
    useCartStore.getState().addLine({ productId: 'p-2', qty: 1 });

    useCartStore.getState().removeLine(0);
    expect(useCartStore.getState().lines).toHaveLength(1);
    expect(useCartStore.getState().lines[0].productId).toBe('p-2');
  });

  it('saves and clears gift note', () => {
    useCartStore.getState().setNote('Happy birthday Priya');
    expect(useCartStore.getState().note).toBe('Happy birthday Priya');

    useCartStore.getState().clearCart();
    expect(useCartStore.getState().note).toBe('');
    expect(useCartStore.getState().lines).toEqual([]);
  });

  it('persists and rehydrates from storage event (cross-tab sync)', () => {
    const rawData = {
      state: {
        lines: [{ productId: 'p-sync', options: { material: 'Gold' }, qty: 2 }],
        note: 'Sync note',
      },
      version: 0,
    };

    localStorage.setItem('byraya-bag', JSON.stringify(rawData));

    // Dispatch window storage event as if from another tab
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'byraya-bag',
        newValue: JSON.stringify(rawData),
      })
    );

    useCartStore.persist.rehydrate();

    const state = useCartStore.getState();
    expect(state.lines).toHaveLength(1);
    expect(state.lines[0].productId).toBe('p-sync');
    expect(state.note).toBe('Sync note');
  });
});
