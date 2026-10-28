import { formatINR } from '../../lib/money';

export interface MessageLineItem {
  name: string;
  options?: {
    material?: string;
    size?: string;
  };
  qty: number;
  lineTotalPaise: number;
}

export interface BuildMessageParams {
  brandName?: string;
  ref: string;
  items: MessageLineItem[];
  subtotalPaise: number;
  note?: string | null;
}

export function buildOrderMessage({
  brandName = 'By Raya.co',
  ref,
  items,
  subtotalPaise,
  note,
}: BuildMessageParams): string {
  const lines: string[] = [];

  lines.push(`Hi ${brandName}, I would like to order (ref ${ref}):`);

  for (const item of items) {
    const optionParts = [item.options?.material, item.options?.size].filter(Boolean);
    const optionsStr = optionParts.length > 0 ? ` (${optionParts.join(', ')})` : '';
    const lineTotal = formatINR(item.lineTotalPaise);
    lines.push(`- ${item.name}${optionsStr} x${item.qty} = ${lineTotal}`);
  }

  lines.push(`Subtotal: ${formatINR(subtotalPaise)}`);

  const trimmedNote = note?.trim();
  if (trimmedNote) {
    lines.push(`Gift note: ${trimmedNote}`);
  }

  return lines.join('\n');
}

export function encodeForWhatsApp(message: string): string {
  return encodeURIComponent(message);
}

