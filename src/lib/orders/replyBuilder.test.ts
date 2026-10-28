import { describe, it, expect } from 'vitest';
import { buildAdminReplyMessage } from './replyBuilder';

describe('Admin Reply Message Builder', () => {
  it('formats the admin reply message adhering to docs/CONTENT.md', () => {
    const message = buildAdminReplyMessage({
      ref: 'BR-9X4K2A',
      itemsSummary: 'Lilac Twist Hoops (Gold) x1',
      subtotalPaise: 99800,
    });

    expect(message).toBe(
      'Hi! Thanks for your enquiry BR-9X4K2A for Lilac Twist Hoops (Gold) x1. Your total is ₹998. We’ll confirm availability and next steps here in chat.'
    );
  });

  it('handles prices with paise decimal places via formatINR', () => {
    const message = buildAdminReplyMessage({
      ref: 'BR-11A22B',
      itemsSummary: 'Pearl Droplet Pendant x1',
      subtotalPaise: 124950,
    });

    expect(message).toBe(
      'Hi! Thanks for your enquiry BR-11A22B for Pearl Droplet Pendant x1. Your total is ₹1,249.50. We’ll confirm availability and next steps here in chat.'
    );
  });
});
