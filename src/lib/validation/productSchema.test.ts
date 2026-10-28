import { describe, it, expect } from 'vitest';
import {
  productFormSchema,
  formInputToDbPayload,
  generateSlug,
} from './productSchema';

describe('productFormSchema validation', () => {
  const validBase = {
    name: 'Lilac Twist Hoops',
    slug: 'lilac-twist-hoops',
    category: 'Earrings',
    description: 'Everyday elegance earrings.',
    priceRupees: '499',
    compareAtPriceRupees: '699',
    stockStatus: 'in_stock' as const,
    stockQty: '10',
    badge: 'New drop',
    materials: ['Gold', 'Silver'],
    sizes: [],
    specs: { Material: '18k Gold' },
    isFeatured: true,
    isArchived: false,
  };

  it('validates a correct product form submission', () => {
    const result = productFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it('enforces slug format (lowercase, digits, hyphens)', () => {
    const invalidSlug = { ...validBase, slug: 'Invalid Slug!' };
    const result = productFormSchema.safeParse(invalidSlug);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('slug');
    }

    const validHyphenSlug = { ...validBase, slug: 'valid-slug-123' };
    expect(productFormSchema.safeParse(validHyphenSlug).success).toBe(true);
  });

  it('requires name between 2 and 80 characters', () => {
    expect(productFormSchema.safeParse({ ...validBase, name: 'A' }).success).toBe(false);
    expect(
      productFormSchema.safeParse({ ...validBase, name: 'A'.repeat(81) }).success
    ).toBe(false);
    expect(
      productFormSchema.safeParse({ ...validBase, name: 'Twist Hoops' }).success
    ).toBe(true);
  });

  it('enforces price >= 0', () => {
    expect(
      productFormSchema.safeParse({ ...validBase, priceRupees: '-10' }).success
    ).toBe(false);
    expect(
      productFormSchema.safeParse({ ...validBase, priceRupees: '0' }).success
    ).toBe(true);
  });

  it('enforces compare-at price must exceed the regular price', () => {
    // compareAt equal to price
    const equalResult = productFormSchema.safeParse({
      ...validBase,
      priceRupees: 500,
      compareAtPriceRupees: 500,
    });
    expect(equalResult.success).toBe(false);
    if (!equalResult.success) {
      expect(equalResult.error.issues[0].message).toContain('higher than');
    }

    // compareAt lower than price
    const lowerResult = productFormSchema.safeParse({
      ...validBase,
      priceRupees: 500,
      compareAtPriceRupees: 400,
    });
    expect(lowerResult.success).toBe(false);

    // compareAt strictly higher
    const higherResult = productFormSchema.safeParse({
      ...validBase,
      priceRupees: 500,
      compareAtPriceRupees: 600,
    });
    expect(higherResult.success).toBe(true);
  });

  it('enforces max 600 characters on description', () => {
    const tooLong = 'A'.repeat(601);
    expect(
      productFormSchema.safeParse({ ...validBase, description: tooLong }).success
    ).toBe(false);

    const withinLimit = 'A'.repeat(600);
    expect(
      productFormSchema.safeParse({ ...validBase, description: withinLimit }).success
    ).toBe(true);
  });

  it('automatically forces stock_status to sold_out when stockQty is 0', () => {
    const parsed = productFormSchema.parse({
      ...validBase,
      stockStatus: 'in_stock',
      stockQty: 0,
    });
    const payload = formInputToDbPayload(parsed);
    expect(payload.stock_status).toBe('sold_out');
  });

  it('correctly converts rupees to integer paise without float drift', () => {
    const parsed = productFormSchema.parse({
      ...validBase,
      priceRupees: '499.50',
      compareAtPriceRupees: '699.99',
    });
    const payload = formInputToDbPayload(parsed);
    expect(payload.price_paise).toBe(49950);
    expect(payload.compare_at_price_paise).toBe(69999);
  });

  it('generateSlug produces clean lowercase kebab slugs', () => {
    expect(generateSlug('Lilac Twist Hoops')).toBe('lilac-twist-hoops');
    expect(generateSlug('  Rose & Gold Ring #5  ')).toBe('rose-gold-ring-5');
    expect(generateSlug('Sparkle---Pendant')).toBe('sparkle-pendant');
  });
});

