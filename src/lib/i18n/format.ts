import { CATEGORY_BN, SECTION_BN, STRINGS, type StringKey } from './strings';
import type { Lang } from './context';

const LOCALE: Record<Lang, string> = { en: 'en-US', bn: 'bn-BD' };

/** Look up an interface string and fill `{name}` placeholders. */
export function translate(lang: Lang, key: StringKey, vars?: Record<string, string | number>): string {
  const raw = STRINGS[lang][key] ?? STRINGS.en[key];
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? formatValue(lang, vars[k]) : m));
}

function formatValue(lang: Lang, v: string | number): string {
  return typeof v === 'number' ? formatNumber(lang, v) : v;
}

export function formatNumber(lang: Lang, n: number): string {
  return new Intl.NumberFormat(LOCALE[lang], { maximumFractionDigits: 0, useGrouping: false }).format(n);
}

export function formatDateIn(lang: Lang, value?: string | null, opts: Intl.DateTimeFormatOptions = {}): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(LOCALE[lang], { month: 'short', day: 'numeric', year: 'numeric', ...opts });
}

/** "3h ago" / "৩ ঘণ্টা আগে"; dates older than a week are shown as a date. */
export function timeAgoIn(lang: Lang, value?: string | null, now: Date = new Date()): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.round((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return translate(lang, 'story.justNow');
  const mins = Math.round(diff / 60);
  const hours = Math.round(mins / 60);
  const days = Math.round(hours / 24);
  if (lang === 'en') {
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDateIn(lang, value);
  }
  const rtf = new Intl.RelativeTimeFormat(LOCALE[lang], { numeric: 'always' });
  if (mins < 60) return rtf.format(-mins, 'minute');
  if (hours < 24) return rtf.format(-hours, 'hour');
  if (days < 7) return rtf.format(-days, 'day');
  return formatDateIn(lang, value);
}

export function sectionTextIn(lang: Lang, key: string, en: { label: string; title: string; dek: string }) {
  return lang === 'bn' && SECTION_BN[key] ? SECTION_BN[key] : { label: en.label, title: en.title, dek: en.dek };
}

export function categoryNameIn(lang: Lang, slug: string | undefined, fallback: string): string {
  return lang === 'bn' && slug && CATEGORY_BN[slug] ? CATEGORY_BN[slug] : fallback;
}
