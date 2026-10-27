import { describe, it, expect } from 'vitest';
import { buildOrderMessage, encodeForWhatsApp } from './messageBuilder';

describe('Message Builder', () => {
  it('formats order message according to template with note', () => {
    const message = buildOrderMessage({
      brandName: 'By Raya.co',
      ref: 'BR-7K3F9A',
      items: [
        {
          name: 'Lilac Twist Hoops',
          options: { material: 'Gold' },
          qty: 1,
          lineTotalPaise: 49900,
        },
        {
          name: 'Bow Studs',
          options: { material: 'Gold' },
          qty: 2,
          lineTotalPaise: 79800,
        },
      ],
      subtotalPaise: 129700,
      note: 'Happy birthday Riya',
    });

    const expected = [
      'Hi By Raya.co, I would like to order (ref BR-7K3F9A):',
      '- Lilac Twist Hoops (Gold) x1 = ₹499',
      '- Bow Studs (Gold) x2 = ₹798',
      'Subtotal: ₹1,297',
      'Gift note: Happy birthday Riya',
    ].join('\n');

    expect(message).toBe(expected);
  });

  it('omits gift note line completely when note is empty or undefined', () => {
    const message = buildOrderMessage({
      brandName: 'By Raya.co',
      ref: 'BR-123456',
      items: [
        {
          name: 'Seashell Cuff',
          qty: 1,
          lineTotalPaise: 89900,
        },
      ],
      subtotalPaise: 89900,
      note: '   ',
    });

    expect(message).not.toContain('Gift note:');
    expect(message).toBe(
      'Hi By Raya.co, I would like to order (ref BR-123456):\n- Seashell Cuff x1 = ₹899\nSubtotal: ₹899'
    );
  });

  it('correctly encodes message for WhatsApp with ₹ symbol, emojis, and newlines', () => {
    const message = 'Hi By Raya.co, total: ₹499 ✨\nNext line';
    const encoded = encodeForWhatsApp(message);

    expect(encoded).toContain('%E2%82%B9'); // ₹ symbol
    expect(encoded).toContain('%0A'); // newline
    expect(encoded).toContain('%E2%9C%A8'); // sparkle emoji
    expect(decodeURIComponent(encoded)).toBe(message);
  });
});
