import { describe, it, expect } from 'vitest';
import { buildAdminReplyMessage } from './replyBuilder';

describe('Admin Reply Message Builder', () => {
  it('formats the admin reply message adhering to docs/CONTENT.md', () => {
    const message = buildAdminReplyMessage({
      ref: 'BR-9X4K2A',
      subtotalPaise: 99800,
    });

    expect(message).toBe(
      'Hi! Thanks for your order BR-9X4K2A. Your total is ₹998. Please send your name, phone number and full delivery address and we’ll confirm it.'
    );
  });

  it('handles prices with paise decimal places via formatINR', () => {
    const message = buildAdminReplyMessage({
      ref: 'BR-11A22B',
      subtotalPaise: 124950,
    });

    expect(message).toBe(
      'Hi! Thanks for your order BR-11A22B. Your total is ₹1,249.50. Please send your name, phone number and full delivery address and we’ll confirm it.'
    );
  });
});
