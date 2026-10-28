import { describe, it, expect } from 'vitest';
import {
  isValidOrderTransition,
  getNextOrderStatus,
  ORDER_STATUS_FLOW,
} from './statusStepper';

describe('Order Status Stepper & Transitions', () => {
  it('allows natural progression along the fulfillment flow', () => {
    expect(isValidOrderTransition('confirmed', 'processing')).toBe(true);
    expect(isValidOrderTransition('processing', 'packed')).toBe(true);
    expect(isValidOrderTransition('packed', 'shipped')).toBe(true);
    expect(isValidOrderTransition('shipped', 'delivered')).toBe(true);
  });

  it('allows cancellation from any active in-flight status', () => {
    expect(isValidOrderTransition('confirmed', 'cancelled')).toBe(true);
    expect(isValidOrderTransition('processing', 'cancelled')).toBe(true);
    expect(isValidOrderTransition('packed', 'cancelled')).toBe(true);
    expect(isValidOrderTransition('shipped', 'cancelled')).toBe(true);
  });

  it('disallows cancellation or modifications once delivered', () => {
    expect(isValidOrderTransition('delivered', 'cancelled')).toBe(false);
    expect(isValidOrderTransition('delivered', 'shipped')).toBe(false);
    expect(isValidOrderTransition('delivered', 'confirmed')).toBe(false);
  });

  it('disallows transitions once cancelled', () => {
    expect(isValidOrderTransition('cancelled', 'confirmed')).toBe(false);
    expect(isValidOrderTransition('cancelled', 'delivered')).toBe(false);
    expect(isValidOrderTransition('cancelled', 'processing')).toBe(false);
  });

  it('computes next order status in sequential order', () => {
    expect(getNextOrderStatus('confirmed')).toBe('processing');
    expect(getNextOrderStatus('processing')).toBe('packed');
    expect(getNextOrderStatus('packed')).toBe('shipped');
    expect(getNextOrderStatus('shipped')).toBe('delivered');
    expect(getNextOrderStatus('delivered')).toBeNull();
    expect(getNextOrderStatus('cancelled')).toBeNull();
  });

  it('verifies exact 5 sequential fulfillment steps', () => {
    expect(ORDER_STATUS_FLOW).toEqual([
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'delivered',
    ]);
  });
});
