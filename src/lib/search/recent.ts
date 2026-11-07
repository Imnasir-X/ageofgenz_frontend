/** Recent searches, kept only in this browser (localStorage). Newest first, de-duplicated case-insensitively. */
export const RECENT_KEY = 'agz:recent-searches';
export const RECENT_MAX = 6;

const storage = (): Storage | null => {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
};

export function getRecentSearches(): string[] {
  const s = storage();
  if (!s) return [];
  try {
    const raw = JSON.parse(s.getItem(RECENT_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string' && v.trim() !== '').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function write(list: string[]) {
  try {
    storage()?.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked: recents are a convenience, not required */
  }
}

export function addRecentSearch(query: string): string[] {
  const q = query.trim().replace(/\s+/g, ' ');
  if (q.length < 2) return getRecentSearches();
  const next = [q, ...getRecentSearches().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, RECENT_MAX);
  write(next);
  return next;
}

export function removeRecentSearch(query: string): string[] {
  const next = getRecentSearches().filter((r) => r.toLowerCase() !== query.toLowerCase());
  write(next);
  return next;
}

export function clearRecentSearches(): string[] {
  write([]);
  return [];
}
