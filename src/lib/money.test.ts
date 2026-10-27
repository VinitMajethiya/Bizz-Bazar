import { describe, it, expect } from 'vitest';
import { formatINR, rupeesToPaise, savingPercent } from './money';

describe('Money helpers', () => {
  describe('formatINR', () => {
    it('formats exact rupees without trailing decimal zeros', () => {
      expect(formatINR(49900)).toBe('₹499');
      expect(formatINR(129900)).toBe('₹1,299');
    });

    it('formats paise amounts correctly with decimals', () => {
      expect(formatINR(99)).toBe('₹0.99');
      expect(formatINR(49950)).toBe('₹499.50');
    });

    it('formats zero paise correctly', () => {
      expect(formatINR(0)).toBe('₹0');
    });
  });

  describe('rupeesToPaise', () => {
    it('converts string rupees to integer paise', () => {
      expect(rupeesToPaise('499')).toBe(49900);
      expect(rupeesToPaise('499.5')).toBe(49950);
      expect(rupeesToPaise('0.99')).toBe(99);
    });

    it('converts numeric values without floating point drift', () => {
      // 0.1 + 0.2 in JS is 0.30000000000000004
      expect(rupeesToPaise(0.1 + 0.2)).toBe(30);
      expect(rupeesToPaise(1299)).toBe(129900);
    });
  });

  describe('savingPercent', () => {
    it('calculates the percentage saved correctly', () => {
      // compare 69900, price 49900 -> (1 - 499/699) * 100 = 28.61% -> 29%
      expect(savingPercent(49900, 69900)).toBe(29);
      // compare 149900, price 119900 -> (1 - 1199/1499) * 100 = 20.01% -> 20%
      expect(savingPercent(119900, 149900)).toBe(20);
    });

    it('returns 0 when compareAt is null or less than/equal to price', () => {
      expect(savingPercent(49900, null)).toBe(0);
      expect(savingPercent(49900, 49900)).toBe(0);
      expect(savingPercent(49900, 39900)).toBe(0);
    });
  });
});
