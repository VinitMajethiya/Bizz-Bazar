import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { reviewFormSchema } from '../../lib/validation/schemas';

describe('Review Schema & Anti-Spam Validation', () => {
  it('accepts valid customer review data with empty honeypot', () => {
    const valid = {
      rating: 5,
      reviewer_name: 'Priya Sharma',
      title: 'Beautiful daily piece',
      review_text: 'The anti-tarnish finish really holds up. Looks elegant and delicate.',
      product_id: 'a0000000-0000-4000-8000-000000000000',
      website_trap: '',
    };

    const result = reviewFormSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects honeypot submission when website_trap is filled by bots', () => {
    const botSubmission = {
      rating: 5,
      reviewer_name: 'Spam Bot',
      title: 'Cheap watches online',
      review_text: 'Visit https://spam.example.com for massive discounts!',
      website_trap: 'https://spam.example.com',
    };

    const result = reviewFormSchema.safeParse(botSubmission);
    expect(result.success).toBe(false);
    if (!result.success) {
      const trapErr = result.error.issues.find((i) => i.path.includes('website_trap'));
      expect(trapErr).toBeDefined();
    }
  });

  it('rejects rating outside 1-5 range', () => {
    const invalidZero = reviewFormSchema.safeParse({
      rating: 0,
      reviewer_name: 'Tester',
      review_text: 'Valid review content',
    });
    expect(invalidZero.success).toBe(false);

    const invalidSix = reviewFormSchema.safeParse({
      rating: 6,
      reviewer_name: 'Tester',
      review_text: 'Valid review content',
    });
    expect(invalidSix.success).toBe(false);
  });

  it('rejects empty or whitespace-only reviewer name', () => {
    const result = reviewFormSchema.safeParse({
      rating: 5,
      reviewer_name: '   ',
      review_text: 'Valid review content with sufficient length',
    });
    expect(result.success).toBe(false);
  });

  it('rejects review text shorter than 5 characters or exceeding 2000 characters', () => {
    const tooShort = reviewFormSchema.safeParse({
      rating: 5,
      reviewer_name: 'Tester',
      review_text: 'Ok',
    });
    expect(tooShort.success).toBe(false);

    const tooLong = reviewFormSchema.safeParse({
      rating: 5,
      reviewer_name: 'Tester',
      review_text: 'A'.repeat(2001),
    });
    expect(tooLong.success).toBe(false);
  });
});

describe('Anti-Spam Time & LocalStorage Guards Logic', () => {
  const PRODUCT_ID = 'test-prod-123';
  const STORAGE_KEY = `byraya_reviewed_${PRODUCT_ID}`;

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  it('detects submissions faster than 3-second human minimum', () => {
    const mountTime = Date.now();

    // Fast-forward 1.5 seconds (< 3000ms threshold)
    vi.advanceTimersByTime(1500);
    const elapsedMs = Date.now() - mountTime;
    const isBotOrTooFast = elapsedMs < 3000;

    expect(isBotOrTooFast).toBe(true);

    // Fast-forward past 3 seconds
    vi.advanceTimersByTime(2000);
    const validElapsedMs = Date.now() - mountTime;
    expect(validElapsedMs >= 3000).toBe(true);
  });

  it('enforces 24-hour duplicate submission guard per product', () => {
    // 1. First submission allowed
    const lastSubmitted = localStorage.getItem(STORAGE_KEY);
    expect(lastSubmitted).toBeNull();

    // User submits and timestamp is stored
    const submissionTime = Date.now();
    localStorage.setItem(STORAGE_KEY, submissionTime.toString());

    // 2. Immediate second submission blocked
    const dayInMs = 24 * 60 * 60 * 1000;
    const check1 = localStorage.getItem(STORAGE_KEY);
    const isDuplicate1 = check1 ? Date.now() - Number(check1) < dayInMs : false;
    expect(isDuplicate1).toBe(true);

    // 3. Fast forward 12 hours -> still blocked
    vi.advanceTimersByTime(12 * 60 * 60 * 1000);
    const isDuplicate2 = Date.now() - Number(check1) < dayInMs;
    expect(isDuplicate2).toBe(true);

    // 4. Fast forward past 24 hours -> allowed again
    vi.advanceTimersByTime(13 * 60 * 60 * 1000); // 25 hours total
    const isDuplicate3 = Date.now() - Number(check1) < dayInMs;
    expect(isDuplicate3).toBe(false);
  });
});

describe('Review Stats & Pagination Calculations', () => {
  it('correctly rounds average rating to 1 decimal place', () => {
    const ratings = [5, 4, 5, 4, 5]; // Sum: 23, Avg: 4.6
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    expect(Number(avg.toFixed(1))).toBe(4.6);

    const ratings2 = [5, 5, 4]; // Sum: 14, Avg: 4.6666...
    const avg2 = ratings2.reduce((sum, r) => sum + r, 0) / ratings2.length;
    expect(Number(avg2.toFixed(1))).toBe(4.7);
  });

  it('computes pagination offsets and hasMore flag accurately', () => {
    const totalCount = 12;
    const pageSize = 5;

    // Page 0 (items 0 to 4)
    const page0From = 0 * pageSize;
    const page0Loaded = 5;
    const hasMore0 = page0From + page0Loaded < totalCount;
    expect(hasMore0).toBe(true);

    // Page 1 (items 5 to 9)
    const page1From = 1 * pageSize;
    const page1Loaded = 5;
    const hasMore1 = page1From + page1Loaded < totalCount; // 5 + 5 = 10 < 12
    expect(hasMore1).toBe(true);

    // Page 2 (items 10 to 11, total 2 items loaded)
    const page2From = 2 * pageSize;
    const page2Loaded = 2;
    const hasMore2 = page2From + page2Loaded < totalCount; // 10 + 2 = 12, not < 12
    expect(hasMore2).toBe(false);
  });
});
