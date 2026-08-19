// -----------------------------------------------------------------------
// Pure display-formatting helpers. Kept separate from lib/api.js so the
// data-fetching code stays free of presentation concerns.
// -----------------------------------------------------------------------

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "2026-07-10" -> "Fri" — used as the x-axis label on the trend chart. */
export function toWeekdayLabel(isoDate) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return WEEKDAY_LABELS[date.getUTCDay()];
}

/** "2026-07-13T14:02:11Z" -> "12s ago" / "6m ago" / "2h ago" / "3d ago" */
export function toRelativeTime(isoTimestamp) {
  const then = new Date(isoTimestamp).getTime();
  const diffSeconds = Math.max(0, Math.floor((Date.now() - then) / 1000));

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
