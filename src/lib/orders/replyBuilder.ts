import { formatINR } from '../money';

export interface ReplyMessageParams {
  ref: string;
  itemsSummary: string;
  subtotalPaise: number;
}

/**
 * Builds the admin reply message from docs/CONTENT.md:
 * "Hi! Thanks for your enquiry {ref} for {items}. Your total is {subtotal}. We’ll confirm availability and next steps here in chat."
 */
export function buildAdminReplyMessage({
  ref,
  itemsSummary,
  subtotalPaise,
}: ReplyMessageParams): string {
  const formattedSubtotal = formatINR(subtotalPaise);
  return `Hi! Thanks for your enquiry ${ref} for ${itemsSummary}. Your total is ${formattedSubtotal}. We’ll confirm availability and next steps here in chat.`;
}
