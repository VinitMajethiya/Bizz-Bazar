import { describe, it, expect } from 'vitest';
import { formatAge } from './formatAge';

describe('Relative Age Formatter', () => {
  const baseTime = new Date('2026-10-28T12:00:00Z');

  it('returns "Just now" for times under a minute', () => {
    const thirtySecsAgo = new Date(baseTime.getTime() - 30 * 1000).toISOString();
    expect(formatAge(thirtySecsAgo, baseTime)).toBe('Just now');
  });

  it('returns minutes for times under an hour', () => {
    const twelveMinsAgo = new Date(baseTime.getTime() - 12 * 60 * 1000).toISOString();
    expect(formatAge(twelveMinsAgo, baseTime)).toBe('12 min ago');

    const oneMinAgo = new Date(baseTime.getTime() - 60 * 1000).toISOString();
    expect(formatAge(oneMinAgo, baseTime)).toBe('1 min ago');
  });

  it('returns hours for times under 24 hours', () => {
    const oneHourAgo = new Date(baseTime.getTime() - 60 * 60 * 1000).toISOString();
    expect(formatAge(oneHourAgo, baseTime)).toBe('1 hour ago');

    const fourHoursAgo = new Date(baseTime.getTime() - 4 * 60 * 60 * 1000).toISOString();
    expect(formatAge(fourHoursAgo, baseTime)).toBe('4 hours ago');
  });

  it('returns "Yesterday" for dates between 24 and 48 hours ago', () => {
    const yesterday = new Date(baseTime.getTime() - 25 * 60 * 60 * 1000).toISOString();
    expect(formatAge(yesterday, baseTime)).toBe('Yesterday');
  });

  it('returns days for dates older than 48 hours', () => {
    const threeDaysAgo = new Date(baseTime.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatAge(threeDaysAgo, baseTime)).toBe('3 days ago');
  });

  it('handles invalid date strings gracefully', () => {
    expect(formatAge('invalid-date')).toBe('');
  });
});
