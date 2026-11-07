import type { Article } from '@/lib/api/types';

/** The newsroom's home time zone: "today" on the home page means today in Dhaka. */
export const NEWSROOM_TZ = 'Asia/Dhaka';

const dayKey = (d: Date, timeZone = NEWSROOM_TZ) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const valid = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatNewsroomDate = (d: Date, opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' }) =>
  d.toLocaleDateString('en-US', { timeZone: NEWSROOM_TZ, ...opts });

export function isTodayInDhaka(iso: string | null | undefined, now: Date = new Date()): boolean {
  const d = valid(iso);
  return Boolean(d && dayKey(d) === dayKey(now));
}

/**
 * Masthead label for the home page. "Today's briefing" only when the newest story really is from
 * today (Asia/Dhaka); otherwise "Latest" with the real date of the newest story.
 */
export function homeFreshnessLabel(newestIso: string | null | undefined, now: Date = new Date()): { label: string; date: string; isToday: boolean } {
  const newest = valid(newestIso);
  if (newest && dayKey(newest) === dayKey(now)) {
    return { label: 'Today’s briefing', date: formatNewsroomDate(now), isToday: true };
  }
  if (!newest) return { label: 'Latest', date: '', isToday: false };
  const sameYear = dayKey(newest).slice(0, 4) === dayKey(now).slice(0, 4);
  return {
    label: 'Latest',
    date: `Newest story ${formatNewsroomDate(newest, { month: 'long', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })}`,
    isToday: false,
  };
}

/** Grace period before an edit counts as an update (matches the backend's trust rules). */
export const UPDATED_GRACE_MS = 15 * 60 * 1000;
/**
 * When the API cannot say whether the text changed (no is_updated / content_updated_at), the
 * generic updated_at also moves on housekeeping saves, so require a much larger gap.
 */
export const UPDATED_FALLBACK_MS = 6 * 60 * 60 * 1000;

/** When the story was meaningfully updated after publication, else null. */
export function meaningfulUpdate(article: Pick<Article, 'publishedAt' | 'updatedAt' | 'isUpdated' | 'contentUpdatedAt'>): Date | null {
  const published = valid(article.publishedAt);
  if (!published) return null;
  if (article.isUpdated === false) return null;
  const content = valid(article.contentUpdatedAt);
  if (article.isUpdated === true) return content ?? valid(article.updatedAt);
  if (content) return content.getTime() - published.getTime() > UPDATED_GRACE_MS ? content : null;
  const updated = valid(article.updatedAt);
  return updated && updated.getTime() - published.getTime() > UPDATED_FALLBACK_MS ? updated : null;
}
