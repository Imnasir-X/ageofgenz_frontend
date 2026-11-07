import { createContext } from 'react';
import type { SeoProps } from './seo-core';
import type { Article, AuthorProfile } from '@/lib/api/types';

/** Server-side collector: the last <Seo> rendered on a page wins. */
export interface SeoCollector {
  props: SeoProps | null;
  path: string;
}

export const SeoContext = createContext<SeoCollector | null>(null);

/** Data fetched before render (prerender / edge) so pages paint with content immediately. */
export interface InitialData {
  path?: string;
  article?: Article | null;
  articleMissing?: boolean;
  /** Author page data fetched at prerender (page 1). */
  author?: AuthorProfile | null;
  authorMissing?: boolean;
  /** Raw API payload embedded by the article edge function (normalised on the client). */
  articleRaw?: unknown;
}

export const InitialDataContext = createContext<InitialData>({});
