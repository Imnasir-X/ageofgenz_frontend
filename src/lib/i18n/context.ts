import { createContext } from 'react';

export type Lang = 'en' | 'bn';

export interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/** Default (no provider, prerender, tests): English. */
export const LangContext = createContext<LangState>({ lang: 'en', setLang: () => undefined });

export const LANG_STORAGE_KEY = 'agz-lang';
