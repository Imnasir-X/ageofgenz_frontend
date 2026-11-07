import type { Article } from '@/lib/api/types';

export interface HomePlan {
  lead?: Article;
  secondary: Article[];
  briefing: Article[];
  trending: Article[];
  /** True when the trending list is ranked by real view counts (otherwise it is just "more stories"). */
  trendingByViews: boolean;
  /** Every slug placed on the page so far, in order; later modules exclude these. */
  shown: string[];
}

/**
 * Lay out the home feed top to bottom with no story appearing twice. Each module takes only
 * stories no earlier module used; a module that ends up empty is hidden by the page.
 * Lead: the featured non-opinion story, else the newest. Secondary: up to 6 (kept even for the
 * 2-column grid when there are more than 2). Briefing: up to 5. Trending: up to 6, by views
 * when the API provides view counts.
 */
export function planHome(stories: Article[]): HomePlan {
  const seen = new Set<string>();
  const take = (pool: Article[], n: number) => {
    const out: Article[] = [];
    for (const a of pool) {
      if (out.length >= n) break;
      if (!a.slug || seen.has(a.slug)) continue;
      seen.add(a.slug);
      out.push(a);
    }
    return out;
  };

  const featured = stories.find((a) => a.isFeatured && !a.isOpinion) ?? stories[0];
  const lead = featured ? take([featured], 1)[0] : undefined;

  const remaining = () => stories.filter((a) => !seen.has(a.slug)).length;
  let secondaryCount = Math.min(6, remaining());
  if (secondaryCount > 2 && secondaryCount % 2 === 1) secondaryCount -= 1;
  const secondary = take(stories, secondaryCount);
  const briefing = take(stories, 5);

  const trendingByViews = stories.some((a) => typeof a.views === 'number' && a.views > 0);
  const pool = trendingByViews ? [...stories].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)) : stories;
  const trending = take(pool, 6);

  return { lead, secondary, briefing, trending, trendingByViews, shown: [...seen] };
}
