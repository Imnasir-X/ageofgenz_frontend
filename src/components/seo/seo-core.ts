import { SITE_NAME, SITE_URL, TAGLINE, absoluteUrl } from '@/lib/utils';

export interface SeoProps {
  title?: string;
  /** Use the title exactly as given (no " | The Age of GenZ" suffix). */
  rawTitle?: boolean;
  description?: string;
  path?: string;
  image?: string | null;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  article?: { publishedTime?: string; modifiedTime?: string; section?: string; author?: string };
}

export const DEFAULT_TITLE = `${SITE_NAME} — ${TAGLINE}`;
export const DEFAULT_DESCRIPTION =
  'The Age of GenZ is a youth-focused news platform that helps you understand the stories that matter: quick briefings, the original reporting, multiple perspectives and AI-assisted explanations.';
export const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-card.jpg`;

export const ORGANIZATION_LD = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/logo-1024.png`, width: 1024, height: 1024 },
  slogan: TAGLINE,
  email: 'contact@theageofgenz.com',
  sameAs: [
    'https://twitter.com/TheAgeOfGenZ',
    'https://facebook.com/theageofgenz',
    'https://instagram.com/theageofgenz',
    'https://youtube.com/@theageofgenz',
  ],
};

export const WEBSITE_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: 'en',
  publisher: { '@id': `${SITE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search/?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

export interface SeoTag {
  tag: 'title' | 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  text?: string;
}

const canonicalPath = (path: string) => {
  const clean = path.split(/[?#]/)[0] || '/';
  return clean.endsWith('/') ? clean : `${clean}/`;
};

export function buildSeoTags(props: SeoProps, currentPath = '/'): SeoTag[] {
  const title = props.title ? (props.rawTitle ? props.title : `${props.title} | ${SITE_NAME}`) : DEFAULT_TITLE;
  const description = (props.description || DEFAULT_DESCRIPTION).slice(0, 300);
  const url = absoluteUrl(canonicalPath(props.path ?? currentPath));
  const image = props.image ? absoluteUrl(props.image) : DEFAULT_IMAGE;

  const tags: SeoTag[] = [
    { tag: 'title', attrs: {}, text: title },
    { tag: 'meta', attrs: { name: 'description', content: description } },
    { tag: 'link', attrs: { rel: 'canonical', href: url } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: SITE_NAME } },
    { tag: 'meta', attrs: { property: 'og:title', content: title } },
    { tag: 'meta', attrs: { property: 'og:description', content: description } },
    { tag: 'meta', attrs: { property: 'og:type', content: props.type ?? 'website' } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'en_US' } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:site', content: '@TheAgeOfGenZ' } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: props.image ? image : DEFAULT_TWITTER_IMAGE } },
    { tag: 'meta', attrs: { name: 'robots', content: props.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1' } },
  ];
  if (props.article) {
    const a = props.article;
    if (a.publishedTime) tags.push({ tag: 'meta', attrs: { property: 'article:published_time', content: a.publishedTime } });
    if (a.modifiedTime) tags.push({ tag: 'meta', attrs: { property: 'article:modified_time', content: a.modifiedTime } });
    if (a.section) tags.push({ tag: 'meta', attrs: { property: 'article:section', content: a.section } });
    if (a.author) tags.push({ tag: 'meta', attrs: { name: 'author', content: a.author } });
  }
  const extra = props.jsonLd ? (Array.isArray(props.jsonLd) ? props.jsonLd : [props.jsonLd]) : [];
  [ORGANIZATION_LD, ...extra].forEach((entry) => {
    tags.push({ tag: 'script', attrs: { type: 'application/ld+json' }, text: JSON.stringify(entry).replace(/</g, '\\u003c') });
  });
  return tags;
}

const escapeAttr = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeText = (v: string) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function seoTagsToHtml(tags: SeoTag[]): string {
  return tags
    .map(({ tag, attrs, text }) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
        .join('');
      if (tag === 'meta' || tag === 'link') return `<${tag}${a} data-seo>`;
      const body = tag === 'script' ? text ?? '' : escapeText(text ?? '');
      return `<${tag}${a} data-seo>${body}</${tag}>`;
    })
    .join('\n');
}

export function applySeoTags(tags: SeoTag[], doc: Document = document) {
  doc.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
  tags.forEach(({ tag, attrs, text }) => {
    if (tag === 'title') {
      doc.title = text ?? '';
      doc.head.querySelector('title')?.setAttribute('data-seo', '');
      return;
    }
    const el = doc.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.setAttribute('data-seo', '');
    if (text !== undefined) el.textContent = text;
    doc.head.appendChild(el);
  });
}
