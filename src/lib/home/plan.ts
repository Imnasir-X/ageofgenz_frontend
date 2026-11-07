import type { Article } from '@/lib/api/types';

export interface HomeSection {
  key: string;
  title: string;
  href: string;
  stories: Article[];
}

export interface HomePlan {
  lead?: Article;
  secondary: Article[];
  briefing: Article[];
  trending: Article[];
  /** True when the trending list is ranked by real view counts (otherwise it is just "more stories"). */
  trendingByViews: boolean;
  sections: HomeSection[];
  /** Every slug placed on the page, in order. */
  shown: string[];
}

export interface SectionPool {
  key: string;
  title: string;
  href: string;
  stories: Article[];
}

export const LIMITS = { secondary: 6, briefing: 5, trending: 5, section: 3 } as const;

/** Hands out stories so that no slug is ever placed twice on one page. */
export function createDeduper(initial: Iterable<string> = []) {
  const seen = new Set<string>(initial);
  const order: string[] = [...seen];
  const take = (pool: Article[], n: number) => {
    const out: Article[] = [];
    for (const a of pool) {
      if (out.length >= n) break;
      if (!a || !a.slug || seen.has(a.slug)) continue;
      seen.add(a.slug);
      order.push(a.slug);
      out.push(a);
    }
    return out;
  };
  return { take, seen, order };
}

const hasViews = (list: Article[]) => list.some((a) => typeof a.views === 'number' && a.views > 0);

/**
 * Lay out the home feed top to bottom with no story appearing twice. Each module takes only
 * stories no earlier module used; a module that ends up empty is hidden by the page.
 * Lead: the featured non-opinion story, else the newest. Secondary: up to 6 (an even number when
 * there are more than 2, so the 2-column grid has no hole). Briefing: up to 5, preferring stories
 * that carry a why-it-matters line. Trending: up to 5, by views when the API provides view counts.
 * Sections: up to 3 each from their own category pools.
 */
export function planHome(stories: Article[], sectionPools: SectionPool[] = []): HomePlan {
  const { take, order } = createDeduper();

  const featured = stories.find((a) => a.isFeatured && !a.isOpinion) ?? stories[0];
  const lead = featured ? take([featured], 1)[0] : undefined;

  const unused = () => stories.filter((a) => a.slug && !order.includes(a.slug));
  let secondaryCount = Math.min(LIMITS.secondary, unused().length);
  if (secondaryCount > 2 && secondaryCount % 2 === 1) secondaryCount -= 1;
  const secondary = take(stories, secondaryCount);

  const rest = unused();
  const briefing = take([...rest.filter((a) => a.whyItMatters), ...rest.filter((a) => !a.whyItMatters)], LIMITS.briefing);

  const trendingByViews = hasViews(stories);
  const pool = trendingByViews ? [...stories].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)) : stories;
  const trending = take(pool, LIMITS.trending);

  const sections = sectionPools
    .map((s) => ({ key: s.key, title: s.title, href: s.href, stories: take(s.stories, LIMITS.section) }))
    .filter((s) => s.stories.length > 0);

  return { lead, secondary, briefing, trending, trendingByViews, sections, shown: [...order] };
}

/**
 * Take a server-built plan (/api/home/) and enforce the same rules on it client-side: no repeats,
 * module limits, empty sections dropped. The server already dedupes; this is the safety net.
 */
export function sanitizePlan(input: Omit<HomePlan, 'shown'>): HomePlan {
  const { take, order } = createDeduper();
  const lead = input.lead ? take([input.lead], 1)[0] : undefined;
  const secondary = take(input.secondary, LIMITS.secondary);
  const briefing = take(input.briefing, LIMITS.briefing);
  const trending = take(input.trending, LIMITS.trending);
  const sections = input.sections
    .map((s) => ({ ...s, stories: take(s.stories, LIMITS.section) }))
    .filter((s) => s.stories.length > 0);
  return { lead, secondary, briefing, trending, trendingByViews: input.trendingByViews, sections, shown: [...order] };
}

/**
 * Plan with section rows added later (client fallback: category lists arrive after the latest feed).
 * A latest page of 12 is used up by lead, secondary and briefing, so when trending came out empty
 * it is filled from the category stories first (page order), then the rows take what is left.
 */
export function addSections(plan: HomePlan, sectionPools: SectionPool[]): HomePlan {
  if (plan.sections.length) return plan;
  const { take, order } = createDeduper(plan.shown);
  let { trending, trendingByViews } = plan;
  if (!trending.length) {
    const pooled = sectionPools.flatMap((s) => s.stories);
    trendingByViews = hasViews(pooled);
    trending = take(trendingByViews ? [...pooled].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)) : pooled, LIMITS.trending);
  }
  const sections = sectionPools
    .map((s) => ({ key: s.key, title: s.title, href: s.href, stories: take(s.stories, LIMITS.section) }))
    .filter((s) => s.stories.length > 0);
  return { ...plan, trending, trendingByViews, sections, shown: [...order] };
}
