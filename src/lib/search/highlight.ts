export interface Segment {
  text: string;
  match: boolean;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Split `text` into matched / unmatched segments for every query word of 2+ characters (case-insensitive). */
export function splitHighlight(text: string, query: string): Segment[] {
  const words = Array.from(new Set(query.trim().split(/\s+/).filter((w) => w.length >= 2))).sort((a, b) => b.length - a.length);
  if (!text || words.length === 0) return [{ text, match: false }];
  const re = new RegExp(`(${words.map(escape).join('|')})`, 'gi');
  return text
    .split(re)
    .filter((part) => part !== '')
    .map((part) => ({ text: part, match: words.some((w) => w.toLowerCase() === part.toLowerCase()) }));
}
