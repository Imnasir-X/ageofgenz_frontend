// Vercel Edge Function: server-renders article pages that were not prerendered at build time.
//
// Crawlers and people get the SAME HTML: the full article body, headline, byline, dates,
// canonical/OG/Twitter tags and NewsArticle JSON-LD, inside the normal app shell. The React
// app then takes over on the client (it re-renders from the embedded article data, so there
// is no second fetch and no hydration mismatch). This replaces the old bot-only, excerpt-only
// HTML, which risked being treated as cloaking.
export const config = { runtime: 'edge' };

const API = 'https://ageofgenz-backend.onrender.com';
const SITE = 'https://theageofgenz.com';
const SITE_NAME = 'The Age of GenZ';
const NEWSROOM = 'The Age of GenZ Newsroom';

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const sanitize = (html) =>
  String(html || '')
    .replace(/<(script|style|object|embed|form|iframe)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|object|embed|form|meta|link|base|iframe)[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*("|')\s*(javascript|vbscript|data:text\/html)[^"']*\2/gi, '$1="#"');

const strip = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const ACRONYMS = new Map(['AI', 'UK', 'EU', 'UN', 'NBA', 'NFL', 'CEO', 'GDP', 'BBC', 'CNN', 'NASA', 'FBI', 'CIA', 'USA', 'NATO', 'IMF', 'LLM', 'GPT', 'API'].map((a) => [a.toLowerCase(), a]));
const fixTitle = (t) => String(t || '').replace(/\b[A-Z][a-z]+\b/g, (w) => ACRONYMS.get(w.toLowerCase()) || w);

function renderBody(article) {
  const blocks = Array.isArray(article.content_blocks) ? article.content_blocks : [];
  if (!blocks.length) return sanitize(article.content || '');
  return blocks
    .map((b) => {
      if (!b || typeof b !== 'object') return '';
      if (b.type === 'heading') return b.level === 'h3' ? `<h3>${esc(b.text)}</h3>` : `<h2>${esc(b.text)}</h2>`;
      if (b.type === 'quote') return `<blockquote><p>${esc(b.text)}</p>${b.author ? `<cite>— ${esc(b.author)}</cite>` : ''}</blockquote>`;
      if (b.type === 'image' && /^https?:\/\//.test(b.url || ''))
        return `<figure><img src="${esc(b.url)}" alt="${esc(b.alt || b.caption || '')}" loading="lazy">${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      if (b.type === 'paragraph') return `<p>${esc(b.text)}</p>`;
      return '';
    })
    .join('\n');
}

function headTags(a, url) {
  const title = `${fixTitle(a.meta_title || a.title)} | ${SITE_NAME}`;
  const description = strip(a.meta_description || a.excerpt || '').slice(0, 300);
  const image = a.featured_image_url || `${SITE}/og-image.jpg`;
  const category = (a.category && a.category.name) || a.category_name || 'News';
  const published = a.published_at || a.created_at || '';
  const modified = a.updated_at || published;
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: fixTitle(a.title).slice(0, 110),
      description,
      image: [image],
      datePublished: published,
      dateModified: modified,
      author: [{ '@type': 'Organization', name: NEWSROOM, url: `${SITE}/about/` }],
      publisher: { '@type': 'NewsMediaOrganization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE}/logo.png` } },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      articleSection: category,
      isAccessibleForFree: true,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: category, item: `${SITE}/category/${(a.category && a.category.slug) || 'news'}/` },
        { '@type': 'ListItem', position: 3, name: fixTitle(a.title), item: url },
      ],
    },
  ];
  const meta = [
    `<title data-seo>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}" data-seo>`,
    `<link rel="canonical" href="${esc(url)}" data-seo>`,
    `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" data-seo>`,
    `<meta property="og:site_name" content="${SITE_NAME}" data-seo>`,
    `<meta property="og:type" content="article" data-seo>`,
    `<meta property="og:title" content="${esc(title)}" data-seo>`,
    `<meta property="og:description" content="${esc(description)}" data-seo>`,
    `<meta property="og:url" content="${esc(url)}" data-seo>`,
    `<meta property="og:image" content="${esc(image)}" data-seo>`,
    `<meta property="article:published_time" content="${esc(published)}" data-seo>`,
    `<meta property="article:modified_time" content="${esc(modified)}" data-seo>`,
    `<meta property="article:section" content="${esc(category)}" data-seo>`,
    `<meta name="twitter:card" content="summary_large_image" data-seo>`,
    `<meta name="twitter:title" content="${esc(title)}" data-seo>`,
    `<meta name="twitter:description" content="${esc(description)}" data-seo>`,
    `<meta name="twitter:image" content="${esc(image)}" data-seo>`,
  ];
  ld.forEach((entry) => meta.push(`<script type="application/ld+json" data-seo>${JSON.stringify(entry).replace(/</g, '\\u003c')}</script>`));
  return meta.join('\n');
}

function articleMarkup(a) {
  const published = a.published_at || a.created_at || '';
  const date = published ? new Date(published).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const category = (a.category && a.category.name) || a.category_name || 'News';
  return `<main id="main"><article class="container" style="max-width:64rem;padding-top:3rem">
<nav aria-label="Breadcrumb"><a href="/">Home</a> › <a href="/category/${esc((a.category && a.category.slug) || 'news')}/">${esc(category)}</a></nav>
<h1>${esc(fixTitle(a.title))}</h1>
${a.excerpt ? `<p class="dek">${esc(strip(a.excerpt))}</p>` : ''}
<p class="byline">By ${NEWSROOM}${date ? ` · <time datetime="${esc(published)}">${esc(date)}</time>` : ''}</p>
<div class="article-body">${renderBody(a)}</div>
</article></main>`;
}

async function fetchWithTimeout(url, ms, init = {}) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms) });
}

export default async function handler(request) {
  const url = new URL(request.url);
  const slug = (url.searchParams.get('slug') || '').replace(/\/+$/, '');
  if (!slug) return new Response('Missing slug', { status: 400, headers: { 'content-type': 'text/plain' } });
  const canonical = `${SITE}/articles/${encodeURIComponent(slug)}/`;

  // Neutral app shell (header/footer only), prerendered at build time.
  let shell;
  try {
    const res = await fetchWithTimeout(`${url.origin}/__shell/index.html`, 5000);
    shell = res.ok ? await res.text() : null;
  } catch {
    shell = null;
  }
  if (!shell) {
    return Response.redirect(`${url.origin}/`, 302);
  }

  let article = null;
  let status = 200;
  try {
    const res = await fetchWithTimeout(`${API}/api/articles/${encodeURIComponent(slug)}/?include_blocks=1`, 9000, {
      headers: { accept: 'application/json' },
    });
    if (res.status === 404) status = 404;
    else if (res.ok) article = await res.json();
  } catch {
    article = null; // backend asleep or slow: the client fetches it instead.
  }

  let html = shell.replace(/<(title|meta|link|script)\b[^>]*\bdata-seo\b[^>]*>(?:[\s\S]*?<\/\1>)?/gi, '');
  // Tell the client this HTML was not prerendered for this URL, so it renders fresh.
  html = html.replace(/(<div id="root")[^>]*>/i, '$1 data-path="">');

  if (article) {
    html = html.replace('</head>', `${headTags(article, canonical)}\n</head>`);
    html = html.replace(/(<div id="root" data-path="">)[\s\S]*?(<\/div>\s*<noscript>)/i, `$1${articleMarkup(article)}</div>\n<script id="__AGZ_DATA__" type="application/json">${JSON.stringify({ path: url.pathname, articleRaw: article }).replace(/</g, '\\u003c')}</script>\n<noscript>`);
  } else if (status === 404) {
    html = html.replace('</head>', '<title>Page not found | The Age of GenZ</title><meta name="robots" content="noindex">\n</head>');
    html = html.replace(/(<noscript>)/i, `<script id="__AGZ_DATA__" type="application/json">${JSON.stringify({ path: url.pathname, articleMissing: true })}</script>\n$1`);
  }

  return new Response(html, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': article ? 'public, max-age=60, s-maxage=600, stale-while-revalidate=86400' : 'no-store',
    },
  });
}
