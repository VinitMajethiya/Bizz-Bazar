import { describe, it, expect } from 'vitest';
import { cleanWhatsAppNumber, dropAlertSchema, reviewFormSchema } from './schemas';

describe('Validation Schemas & Helpers', () => {
  describe('cleanWhatsAppNumber', () => {
    it('strips spaces, plus signs, dashes and parenthesis to digits only', () => {
      expect(cleanWhatsAppNumber('+91 98765-43210')).toBe('919876543210');
      expect(cleanWhatsAppNumber('(+91) 98765 43210')).toBe('919876543210');
      expect(cleanWhatsAppNumber('9876543210')).toBe('9876543210');
    });
  });

  describe('dropAlertSchema', () => {
    it('accepts valid email addresses', () => {
      expect(dropAlertSchema.safeParse({ contact: 'user@example.com' }).success).toBe(true);
      expect(dropAlertSchema.safeParse({ contact: 'riya.sharma@gmail.co.in' }).success).toBe(true);
    });

    it('accepts 10 to 13 digit phone numbers', () => {
      expect(dropAlertSchema.safeParse({ contact: '9876543210' }).success).toBe(true);
      expect(dropAlertSchema.safeParse({ contact: '+919876543210' }).success).toBe(true);
      expect(dropAlertSchema.safeParse({ contact: '919876543210' }).success).toBe(true);
    });

    it('rejects invalid email and too short or too long phone numbers', () => {
      expect(dropAlertSchema.safeParse({ contact: 'invalid-email' }).success).toBe(false);
      expect(dropAlertSchema.safeParse({ contact: '12345' }).success).toBe(false);
      expect(dropAlertSchema.safeParse({ contact: '' }).success).toBe(false);
    });
  });

  describe('reviewFormSchema', () => {
    it('validates a normal review submission', () => {
      const res = reviewFormSchema.safeParse({
        rating: 5,
        reviewer_name: 'Sneha',
        title: 'Loved it!',
        review_text: 'The hoops look gorgeous and have great shine.',
        website_trap: '',
      });
      expect(res.success).toBe(true);
    });

    it('rejects submissions when honeypot trap field is filled', () => {
      const res = reviewFormSchema.safeParse({
        rating: 5,
        reviewer_name: 'SpamBot',
        title: 'Spam',
        review_text: 'Buy cheap items here',
        website_trap: 'http://spam-link.com',
      });
      expect(res.success).toBe(false);
    });
  });
});

