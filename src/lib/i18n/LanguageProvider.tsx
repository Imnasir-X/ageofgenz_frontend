import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LANG_STORAGE_KEY, LangContext, type Lang } from './context';

const readStored = (): Lang | null => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (fromUrl === 'bn' || fromUrl === 'en') return fromUrl;
    const v = window.localStorage.getItem(LANG_STORAGE_KEY);
    return v === 'bn' || v === 'en' ? v : null;
  } catch {
    return null;
  }
};

/**
 * Interface language. Pages are prerendered in English, so the first render is always English
 * (hydration matches the HTML); a saved choice (or ?lang=bn) is applied right after mount.
 */
export function LanguageProvider({ children, initial = 'en' }: { children: ReactNode; initial?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initial);

  useEffect(() => {
    const stored = readStored();
    if (stored && stored !== lang) setLangState(stored);
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* private mode: the choice lasts for this page view */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}
