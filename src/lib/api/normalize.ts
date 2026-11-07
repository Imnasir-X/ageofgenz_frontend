import type { Article, ArticleSource, Author, Category, ContentBlock, Perspective } from './types';
import { stripHtml } from '@/lib/utils';

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const strOrNull = (v: unknown): string | null => (typeof v === 'string' && v.trim().length > 0 ? v : null);

const richText = (input: unknown): string => {
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) return input.filter((x) => typeof x === 'string').join('\n');
  if (isObj(input)) return str(input.rendered) || str(input.html);
  return '';
};

const KNOWN_BLOCKS = new Set(['paragraph', 'heading', 'image', 'quote']);

export const normalizeBlocks = (value: unknown): ContentBlock[] | null => {
  if (!Array.isArray(value)) return null;
  const blocks = value.filter(
    (b): b is ContentBlock => isObj(b) && typeof b.type === 'string' && KNOWN_BLOCKS.has(b.type),
  );
  return blocks.length ? blocks : null;
};

const blocksText = (blocks: ContentBlock[] | null): string =>
  (blocks ?? []).map((b) => (b.type === 'image' ? b.caption ?? '' : b.text ?? '')).join(' ');

const stringList = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    const list = value
      .map((v) => (typeof v === 'string' ? v : isObj(v) ? str(v.text) || str(v.point) : ''))
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length ? list : undefined;
  }
  if (typeof value === 'string' && value.trim()) {
    const lines = value
      .split(/\n+|•/)
      .map((s) => s.replace(/^[-*\d.)\s]+/, '').trim())
      .filter(Boolean);
    return lines.length ? lines : undefined;
  }
  return undefined;
};

const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const sourceList = (value: unknown): ArticleSource[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const list = value
    .map((v): ArticleSource | null => {
      if (typeof v === 'string') {
        return /^https?:\/\//.test(v) ? { title: hostOf(v) || v, url: v, publisher: hostOf(v) || undefined } : null;
      }
      if (!isObj(v)) return null;
      const url = str(v.url) || str(v.link) || str(v.href);
      if (!/^https?:\/\//.test(url)) return null;
      const publisher = str(v.publisher) || str(v.source) || str(v.name) || hostOf(url);
      return { title: str(v.title) || publisher || url, url, publisher: publisher || undefined };
    })
    .filter((x): x is ArticleSource => x !== null);
  return list.length ? list : undefined;
};

const perspectiveList = (value: unknown): Perspective[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const list = value
    .map((v): Perspective | null => {
      if (!isObj(v)) return null;
      const summary = str(v.summary) || str(v.text);
      if (!summary) return null;
      return { label: str(v.label) || str(v.viewpoint) || 'Perspective', summary, url: strOrNull(v.url) ?? undefined };
    })
    .filter((x): x is Perspective => x !== null);
  return list.length ? list : undefined;
};

/**
 * Titles are rendered as stored, except that common acronyms which an upstream
 * title-caser flattened ("Ai", "Nba", "Gdp") are restored. "Us" is left alone because it
 * is also a pronoun; "U.s." is fixed.
 */
const ACRONYMS = ['AI', 'UK', 'EU', 'UN', 'NBA', 'NFL', 'FIFA', 'CEO', 'GDP', 'BBC', 'CNN', 'NASA', 'FBI', 'CIA', 'DOD', 'USA', 'IPO', 'EV', 'EVs', 'LLM', 'LLMs', 'GPT', 'API', 'NATO', 'IMF', 'WHO', 'ICC', 'IPL', 'BNP', 'RAB', 'IT', 'VR', 'AR', 'OpenAI', 'ChatGPT', 'TikTok', 'YouTube', 'iPhone'];
const ACRONYM_MAP = new Map(ACRONYMS.map((a) => [a.toLowerCase(), a]));
const SAFE_LOWER = new Set(['who', 'it']); // only fix when fully lowercase-capitalised inside a title-cased string
export function fixTitleCase(title: string): string {
  const titleCased = /^(\S+\s+){2,}/.test(title) && title.split(/\s+/).filter((w) => /^[a-z]/.test(w)).length <= 1;
  return title
    .replace(/\bU\.s\.(?=\s|$|,)/g, 'U.S.')
    .replace(/\b[A-Za-z][A-Za-z]*\b/g, (word) => {
      const hit = ACRONYM_MAP.get(word.toLowerCase());
      if (!hit || word === hit) return word;
      if (SAFE_LOWER.has(word.toLowerCase())) return word; // ambiguous English words stay as written
      // Only touch words written like "Ai" / "Nba" (initial cap, rest lower) in a title-cased headline.
      if (titleCased && /^[A-Z][a-z]+$/.test(word)) return hit;
      return word;
    });
}

export const NEWSROOM = 'The Age of GenZ Newsroom';
export const WPM = 230;

const normalizeAuthor = (raw: Raw): Author => {
  const a = raw.author;
  let name = '';
  if (isObj(a)) name = str(a.name) || str(a.full_name);
  else if (typeof a === 'string') name = a;
  name = str(raw.author_name) || str(raw.byline) || name;
  // The current API sends one hard-coded house author (with an email). Show it as the
  // newsroom and never surface the email.
  if (!name || /^the age of genz$/i.test(name.trim())) name = NEWSROOM;
  const author: Author = { name };
  if (isObj(a)) {
    if (typeof a.id === 'number') author.id = a.id;
    if (str(a.slug)) author.slug = str(a.slug);
    if (str(a.bio)) author.bio = str(a.bio);
    if (str(a.avatar)) author.avatar = str(a.avatar);
    const url = str(a.url) || str(a.profile_url);
    if (/^(https?:\/\/|\/)/.test(url)) author.url = url;
  }
  return author;
};

const normalizeCategory = (raw: Raw): Category => {
  const c = raw.category;
  if (isObj(c)) {
    return {
      id: Number(c.id) || 0,
      name: str(c.name) || 'News',
      slug: str(c.slug) || 'news',
      description: str(c.description) || undefined,
      parent_slug: strOrNull(c.parent_slug),
    };
  }
  const name = str(c) || str(raw.category_name) || 'News';
  return { id: 0, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
};

export const OPINION_SLUGS = new Set(['opinion', 'opinions', 'editorial', 'commentary', 'op-ed']);

export const normalizeArticle = (input: unknown): Article => {
  const raw: Raw = isObj(input) ? input : {};
  const slug = str(raw.slug);
  const contentBlocks = normalizeBlocks(raw.content_blocks);
  const content = richText(raw.content ?? raw.content_html ?? raw.body);
  const excerpt = stripHtml(richText(raw.excerpt ?? raw.summary ?? raw.description));
  const category = normalizeCategory(raw);
  const words = (blocksText(contentBlocks) || stripHtml(content)).split(/\s+/).filter(Boolean).length;
  const apiRead = Number(raw.estimated_read_time);
  // Reading time from the text itself (~230 wpm). The API value is only used when there is no
  // body to count (list payloads), and only when it is plausible.
  const readMinutes = words >= 50 ? Math.max(1, Math.ceil(words / WPM)) : apiRead > 0 && apiRead < 120 ? Math.round(apiRead) : 1;
  const href = slug ? `/articles/${slug}/` : '/';
  const firstBlockImage = contentBlocks?.find((b) => b.type === 'image' && /^https?:\/\//.test(b.url));
  const image =
    strOrNull(raw.featured_image_url) ??
    (str(raw.featured_image).startsWith('http') ? str(raw.featured_image) : null) ??
    (firstBlockImage && firstBlockImage.type === 'image' ? firstBlockImage.url : null);
  const ai = isObj(raw.ai) ? raw.ai : {};
  const pick = (key: string) => raw[key] ?? ai[key];

  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((t) => (typeof t === 'string' ? t : isObj(t) ? str(t.name) : '')).filter(Boolean)
    : [];

  const article: Article = {
    id: Number(raw.id) || 0,
    title: fixTitleCase(str(raw.title) || 'Untitled'),
    slug,
    href,
    canonicalUrl: href,
    shortLink: strOrNull(raw.short_link),
    excerpt,
    content,
    contentBlocks,
    image,
    imageCaption: strOrNull(raw.featured_image_caption) ?? strOrNull(raw.caption),
    imageCredit: strOrNull(raw.featured_image_credit) ?? strOrNull(raw.image_credit) ?? strOrNull(raw.photo_credit),
    category,
    author: normalizeAuthor(raw),
    isFeatured: Boolean(raw.is_featured),
    isOpinion:
      Boolean(raw.is_opinion) ||
      str(raw.article_type).toLowerCase() === 'opinion' ||
      OPINION_SLUGS.has(category.slug) ||
      OPINION_SLUGS.has(category.parent_slug ?? ''),
    publishedAt: str(raw.published_at) || str(raw.created_at),
    updatedAt: str(raw.updated_at) || str(raw.published_at) || str(raw.created_at),
    readMinutes,
    ...(Number.isFinite(Number(raw.view_count)) && raw.view_count !== null && raw.view_count !== undefined ? { views: Number(raw.view_count) } : {}),
    metaTitle: fixTitleCase(str(raw.meta_title) || str(raw.title)),
    metaDescription: stripHtml(str(raw.meta_description)) || excerpt,
    tags,
  };

  const tldr = stringList(pick('tldr') ?? pick('tl_dr') ?? pick('summary_points'));
  if (tldr) article.tldr = tldr;
  const reviewed = pick('tldr_reviewed') ?? pick('summary_reviewed') ?? pick('reviewed_by_editor') ?? pick('is_reviewed');
  if (reviewed === true) article.aiReviewed = true;
  const why = pick('why_it_matters');
  if (typeof why === 'string' && why.trim()) article.whyItMatters = why.trim();
  const sources = sourceList(pick('sources'));
  if (sources) article.sources = sources;
  const perspectives = perspectiveList(pick('perspectives'));
  if (perspectives) article.perspectives = perspectives;
  const translations = pick('translations');
  const bn = isObj(translations) ? translations.bn : pick('bn');
  if (isObj(bn)) {
    if (str(bn.title)) article.titleBn = str(bn.title);
    const tldrBn = stringList(bn.tldr);
    if (tldrBn) article.tldrBn = tldrBn;
  }
  const related = pick('related');
  if (Array.isArray(related)) {
    const slugs = related.map((r) => (typeof r === 'string' ? r : isObj(r) ? str(r.slug) : '')).filter(Boolean);
    if (slugs.length) article.relatedSlugs = slugs;
  }
  return article;
};

export const normalizeList = (payload: unknown): { results: Article[]; count: number; next: string | null } => {
  if (Array.isArray(payload)) {
    const results = payload.map(normalizeArticle);
    return { results, count: results.length, next: null };
  }
  if (isObj(payload) && Array.isArray(payload.results)) {
    const results = payload.results.map(normalizeArticle);
    return { results, count: Number(payload.count) || results.length, next: typeof payload.next === 'string' ? payload.next : null };
  }
  return { results: [], count: 0, next: null };
};
