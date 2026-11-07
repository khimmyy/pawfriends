import { formatTimeAgo } from '@/utils/time';

// SQLite's CURRENT_TIMESTAMP is UTC with a space instead of "T" and no "Z".
const NOW = new Date('2026-11-07T12:00:00Z');

describe('formatTimeAgo', () => {
  it.each([
    ['2026-11-07 12:00:00', 'just now'],
    ['2026-11-07 11:59:01', 'just now'],
    ['2026-11-07 11:59:00', '1 min ago'],
    ['2026-11-07 11:15:00', '45 min ago'],
    ['2026-11-07 11:00:00', '1 hr ago'],
    ['2026-11-07 07:00:00', '5 hrs ago'],
    ['2026-11-06 12:00:00', '1 day ago'],
    ['2026-11-01 12:00:00', '6 days ago'],
  ])('labels %p as %p', (timestamp, expected) => {
    expect(formatTimeAgo(timestamp, NOW)).toBe(expected);
  });

  it('reads the timestamp as UTC, not local time', () => {
    // Five minutes before NOW in UTC; would be hours off if read as local time.
    expect(formatTimeAgo('2026-11-07 11:55:00', NOW)).toBe('5 min ago');
  });

  it('shows a date for posts a week old or more', () => {
    expect(formatTimeAgo('2026-10-31 12:00:00', NOW)).toBe(new Date('2026-10-31T12:00:00Z').toLocaleDateString());
  });

  it('treats a timestamp slightly in the future as just now', () => {
    expect(formatTimeAgo('2026-11-07 12:00:30', NOW)).toBe('just now');
  });

  it('returns an empty label for an unreadable timestamp', () => {
    expect(formatTimeAgo('not a date', NOW)).toBe('');
  });
});
