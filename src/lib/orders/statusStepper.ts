import type { OrderStatus } from '../database.types';

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'confirmed',
  'processing',
  'packed',
  'shipped',
  'delivered',
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Confirmed',
  processing: 'Processing',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/**
 * Determines whether a transition from one order status to another is valid.
 * - Delivered orders cannot be changed.
 * - Cancelled orders cannot be changed.
 * - Cancellation is permitted from any state other than delivered or cancelled.
 * - Forward progression is valid along the fulfillment pipeline.
 */
export function isValidOrderTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean {
  if (currentStatus === targetStatus) return false;
  if (currentStatus === 'delivered' || currentStatus === 'cancelled') return false;

  if (targetStatus === 'cancelled') {
    return true;
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  const targetIndex = ORDER_STATUS_FLOW.indexOf(targetStatus);

  if (currentIndex === -1 || targetIndex === -1) return false;

  // Allows progressing to next status or correcting back/forth within the flow
  return true;
}

/**
 * Returns the next logical status in the fulfillment pipeline, or null if delivered/cancelled.
 */
export function getNextOrderStatus(currentStatus: OrderStatus): OrderStatus | null {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= ORDER_STATUS_FLOW.length - 1) {
    return null;
  }
  return ORDER_STATUS_FLOW[currentIndex + 1];
}
