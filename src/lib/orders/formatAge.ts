/**
 * Formats an ISO date string into human relative age:
 * e.g., "Just now", "12 min ago", "2 hours ago", "Yesterday", "5 days ago".
 */
export function formatAge(isoDate: string, now: Date = new Date()): string {
  const timestamp = new Date(isoDate).getTime();
  if (isNaN(timestamp)) return '';

  const diffMs = now.getTime() - timestamp;
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) {
    return 'Just now';
  }

  if (diffMin < 60) {
    return `${diffMin} min ago`;
  }

  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }

  if (diffDays === 1) {
    return 'Yesterday';
  }

  return `${diffDays} days ago`;
}
