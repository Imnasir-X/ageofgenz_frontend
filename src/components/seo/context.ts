import { createContext } from 'react';
import type { SeoProps } from './seo-core';
import type { Article } from '@/lib/api/types';

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
}

export const InitialDataContext = createContext<InitialData>({});
