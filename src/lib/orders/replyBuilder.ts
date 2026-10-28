import { formatINR } from '../money';

export interface ReplyMessageParams {
  ref: string;
  subtotalPaise: number;
}

/**
 * Builds the admin reply message from docs/CONTENT.md:
 * "Hi! Thanks for your order {ref}. Your total is {subtotal}. Please send your name, phone number and full delivery address and we’ll confirm it."
 */
export function buildAdminReplyMessage({
  ref,
  subtotalPaise,
}: ReplyMessageParams): string {
  const formattedSubtotal = formatINR(subtotalPaise);
  return `Hi! Thanks for your order ${ref}. Your total is ${formattedSubtotal}. Please send your name, phone number and full delivery address and we’ll confirm it.`;
}
