import { useContext, useMemo } from 'react';
import { LangContext } from './context';
import { categoryNameIn, formatDateIn, formatNumber, sectionTextIn, timeAgoIn, translate } from './format';
import type { StringKey } from './strings';
import { SECTIONS, type Section } from '@/constants/sections';

/** Interface language and helpers. Works without a provider (English). */
export function useI18n() {
  const { lang, setLang } = useContext(LangContext);
  return useMemo(
    () => ({
      lang,
      setLang,
      toggle: () => setLang(lang === 'en' ? 'bn' : 'en'),
      t: (key: StringKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
      num: (n: number) => formatNumber(lang, n),
      date: (value?: string | null, opts?: Intl.DateTimeFormatOptions) => formatDateIn(lang, value, opts),
      ago: (value?: string | null) => timeAgoIn(lang, value),
      /** Section label/title/dek by SECTIONS key. */
      section: (key: string) => sectionTextIn(lang, key, SECTIONS[key] ?? { label: key, title: key, dek: '' }),
      /** Same, for a Section object (matched to its SECTIONS key by path). */
      sectionOf: (s: Section) => {
        const key = Object.keys(SECTIONS).find((k) => SECTIONS[k].path === s.path);
        return key ? sectionTextIn(lang, key, s) : { label: s.label, title: s.title, dek: s.dek };
      },
      category: (slug: string | undefined, fallback: string) => categoryNameIn(lang, slug, fallback),
    }),
    [lang, setLang],
  );
}
