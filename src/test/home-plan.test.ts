import { describe, expect, it } from 'vitest';
import { normalizeArticle } from '@/lib/api/normalize';
import { addSections, planHome, sanitizePlan, LIMITS } from '@/lib/home/plan';
import { parseHomeFeed } from '@/lib/api/client';
import { homeFreshnessLabel, meaningfulUpdate } from '@/lib/dates';
import { imageSrcSet, optimizeImage } from '@/lib/image';

const story = (n: number, extra: Record<string, unknown> = {}) =>
  normalizeArticle({ id: n, slug: `s${n}`, title: `Story ${n}`, category: { id: 1, name: 'Tech', slug: 'tech' }, published_at: '2026-11-07T08:00:00Z', ...extra });

const allSlugs = (p: ReturnType<typeof planHome>) => [p.lead, ...p.secondary, ...p.briefing, ...p.trending, ...p.sections.flatMap((s) => s.stories)].filter(Boolean).map((a) => a!.slug);

describe('planHome (no-repeat home layout)', () => {
  it('never places the same story twice across lead, secondary, briefing, trending and sections', () => {
    const stories = Array.from({ length: 30 }, (_, i) => story(i, { view_count: (i * 7) % 11 }));
    const pools = ['ai', 'tech', 'politics', 'world'].map((key) => ({ key, title: key, href: `/${key}/`, stories: stories.slice(0, 20) }));
    const plan = planHome(stories, pools);
    const slugs = allSlugs(plan);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(plan.secondary.length).toBeLessThanOrEqual(LIMITS.secondary);
    expect(plan.briefing.length).toBeLessThanOrEqual(LIMITS.briefing);
    expect(plan.trending.length).toBeLessThanOrEqual(LIMITS.trending);
    plan.sections.forEach((s) => expect(s.stories.length).toBeLessThanOrEqual(LIMITS.section));
    expect(plan.shown).toEqual(slugs);
  });

  it('uses the featured non-opinion story as lead and ranks trending by views when present', () => {
    const stories = [story(1), story(2, { is_featured: true }), ...Array.from({ length: 14 }, (_, i) => story(10 + i, { view_count: i }))];
    const plan = planHome(stories);
    expect(plan.lead?.slug).toBe('s2');
    expect(plan.trendingByViews).toBe(true);
    const views = plan.trending.map((a) => a.views ?? 0);
    expect([...views].sort((a, b) => b - a)).toEqual(views);
  });

  it('leaves later modules empty instead of repeating when the newsroom is thin', () => {
    const plan = planHome([story(1), story(2), story(3)]);
    expect(plan.lead?.slug).toBe('s1');
    expect(plan.secondary.map((a) => a.slug)).toEqual(['s2', 's3']);
    expect(plan.briefing).toHaveLength(0);
    expect(plan.trending).toHaveLength(0);
    expect(plan.trendingByViews).toBe(false);
  });

  it('keeps the secondary grid even (no hole in two columns) when there are more than two', () => {
    const plan = planHome(Array.from({ length: 6 }, (_, i) => story(i)));
    expect(plan.secondary.length % 2).toBe(0);
  });

  it('adds section rows later without reusing anything already shown, dropping empty rows', () => {
    const stories = Array.from({ length: 8 }, (_, i) => story(i));
    const plan = addSections(planHome(stories), [
      { key: 'tech', title: 'Tech', href: '/tech/', stories },
      { key: 'ai', title: 'AI', href: '/ai/', stories: [...stories, story(50), story(51)] },
    ]);
    const slugs = allSlugs(plan);
    expect(new Set(slugs).size).toBe(slugs.length);
    // Eight latest stories fill lead, secondary and briefing; trending is then filled from the pools.
    expect(plan.trending.map((a) => a.slug)).toEqual(['s50', 's51']);
    expect(plan.sections).toHaveLength(0);
  });

  it('sanitises a server plan that repeats a story', () => {
    const a = story(1);
    const plan = sanitizePlan({ lead: a, secondary: [a, story(2)], briefing: [story(2), story(3)], trending: [story(3)], trendingByViews: true, sections: [{ key: 'ai', title: 'AI', href: '/ai/', stories: [a] }] });
    expect(allSlugs(plan)).toEqual(['s1', 's2', 's3']);
    expect(plan.sections).toHaveLength(0);
  });
});

describe('parseHomeFeed', () => {
  it('reads the /api/home/ payload and returns null for anything else', () => {
    const feed = parseHomeFeed({
      lead: { id: 1, slug: 'a', title: 'A', why_it_matters: 'Because', is_updated: true },
      secondary: [{ id: 2, slug: 'b', title: 'B', reading_time_minutes: 4 }],
      briefing: [],
      trending: [],
      sections: [{ key: 'ai', label: 'AI', category_slug: 'ai-models-and-agents', articles: [{ id: 3, slug: 'c', title: 'C' }] }],
      freshness: { latest_published_at: '2026-11-07T08:00:00Z' },
    });
    expect(feed?.lead?.whyItMatters).toBe('Because');
    expect(feed?.lead?.isUpdated).toBe(true);
    expect(feed?.secondary[0].readMinutes).toBe(4);
    expect(feed?.sections[0].articles[0].slug).toBe('c');
    expect(feed?.latestPublishedAt).toBe('2026-11-07T08:00:00Z');
    expect(parseHomeFeed({ results: [] })).toBeNull();
    expect(parseHomeFeed(null)).toBeNull();
  });
});

describe('freshness and updated labels', () => {
  const now = new Date('2026-11-07T10:00:00Z'); // 16:00 in Dhaka
  it('says "Today\u2019s briefing" only when the newest story is from today in Asia/Dhaka', () => {
    expect(homeFreshnessLabel('2026-11-07T02:00:00Z', now).isToday).toBe(true);
    // 23:00 UTC on Nov 6 is 05:00 Nov 7 in Dhaka: still today there.
    expect(homeFreshnessLabel('2026-11-06T23:00:00Z', now).isToday).toBe(true);
    const old = homeFreshnessLabel('2026-11-05T12:00:00Z', now);
    expect(old.label).toBe('Latest');
    expect(old.date).toContain('November 5');
  });

  it('flags a meaningful update only past the grace period, preferring the backend verdict', () => {
    const base = { publishedAt: '2026-11-07T08:00:00Z', updatedAt: '2026-11-07T08:05:00Z' };
    expect(meaningfulUpdate(base)).toBeNull();
    expect(meaningfulUpdate({ ...base, updatedAt: '2026-11-07T09:00:00Z' })).toBeNull(); // generic updated_at needs 6h
    expect(meaningfulUpdate({ ...base, updatedAt: '2026-11-07T15:00:00Z' })).not.toBeNull();
    expect(meaningfulUpdate({ ...base, contentUpdatedAt: '2026-11-07T08:30:00Z' })).not.toBeNull();
    expect(meaningfulUpdate({ ...base, updatedAt: '2026-11-08T08:00:00Z', isUpdated: false })).toBeNull();
  });
});

describe('responsive images', () => {
  const cdn = 'https://res.cloudinary.com/demo/image/upload/v1/news/a.jpg';
  it('requests f_auto,q_auto and widths from Cloudinary, leaves other hosts alone', () => {
    expect(optimizeImage(cdn, 640)).toContain('/upload/f_auto,q_auto,c_limit,w_640/');
    const set = imageSrcSet(cdn, 320)!;
    expect(set).toContain('w_640/');
    expect(set).toMatch(/ 640w$/);
    expect(imageSrcSet('https://example.com/a.jpg', 640)).toBeUndefined();
  });
});
