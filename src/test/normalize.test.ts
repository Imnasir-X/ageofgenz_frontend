import { describe, expect, it } from 'vitest';
import { fixTitleCase, normalizeArticle, NEWSROOM } from '@/lib/api/normalize';

const raw = {
  id: 1,
  title: 'Anthropic-Pentagon Battle Shows How Big Tech Has Reversed Course On Ai And War',
  slug: 'anthropic-pentagon',
  content: '',
  content_blocks: [
    { id: 'a', type: 'paragraph', text: 'First paragraph of the story, long enough to count as a point.' },
    { id: 'b', type: 'unknown', text: 'dropped' },
  ],
  excerpt: '<p>Short <b>excerpt</b></p>',
  featured_image: null,
  featured_image_url: null,
  category: { id: 2, name: 'Tech', slug: 'tech' },
  author: { id: 1, name: 'The Age Of GenZ', email: 'admin@ageofgenz.com' },
  published_at: '2026-05-16T15:29:00Z',
  updated_at: '2026-05-16T15:30:00Z',
};

describe('normalizeArticle', () => {
  it('restores acronyms flattened by title-casing but keeps other words as stored', () => {
    expect(normalizeArticle(raw).title).toBe('Anthropic-Pentagon Battle Shows How Big Tech Has Reversed Course On AI And War');
    expect(fixTitleCase('Nba Finals And The Us Economy')).toBe('NBA Finals And The Us Economy');
    expect(fixTitleCase('Who Pays for it?')).toBe('Who Pays for it?');
  });

  it('never exposes the hard-coded author email and presents the house byline as the newsroom', () => {
    const a = normalizeArticle(raw);
    expect(a.author.name).toBe(NEWSROOM);
    expect(JSON.stringify(a.author)).not.toContain('@');
  });

  it('keeps only known content blocks, strips HTML from the excerpt and builds the canonical href', () => {
    const a = normalizeArticle(raw);
    expect(a.contentBlocks).toHaveLength(1);
    expect(a.excerpt).toBe('Short excerpt');
    expect(a.href).toBe('/articles/anthropic-pentagon/');
  });

  it('treats AI fields as optional and picks them up when the backend sends them', () => {
    expect(normalizeArticle(raw).tldr).toBeUndefined();
    const a = normalizeArticle({
      ...raw,
      tldr: ['One', 'Two'],
      why_it_matters: 'Because.',
      sources: [{ title: 'Guardian', url: 'https://www.theguardian.com/x' }, 'not-a-url'],
      translations: { bn: { title: 'শিরোনাম', tldr: ['এক'] } },
    });
    expect(a.tldr).toEqual(['One', 'Two']);
    expect(a.whyItMatters).toBe('Because.');
    expect(a.sources).toEqual([{ title: 'Guardian', url: 'https://www.theguardian.com/x', publisher: 'theguardian.com' }]);
    expect(a.titleBn).toBe('শিরোনাম');
  });

  it('labels opinion by category', () => {
    expect(normalizeArticle({ ...raw, category: { id: 9, name: 'Opinion', slug: 'opinion' } }).isOpinion).toBe(true);
    expect(normalizeArticle(raw).isOpinion).toBe(false);
  });
});
