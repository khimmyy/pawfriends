/**
 * Turns a SQLite CURRENT_TIMESTAMP value (UTC, "YYYY-MM-DD HH:MM:SS") into a
 * short label such as "just now", "5 min ago", "2 hrs ago" or "3 days ago".
 */
export function formatTimeAgo(sqliteTimestamp: string, now: Date = new Date()): string {
  const created = new Date(`${sqliteTimestamp.replace(' ', 'T')}Z`);
  const elapsedMs = now.getTime() - created.getTime();
  if (Number.isNaN(elapsedMs)) {
    return '';
  }

  const seconds = Math.max(0, Math.floor(elapsedMs / 1000));
  if (seconds < 60) {
    return 'just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  return created.toLocaleDateString();
}
