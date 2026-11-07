import type { Article } from '@/lib/api/types';
import { NEWSROOM } from '@/lib/api/normalize';
import { categoryHref } from '@/constants/sections';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/utils';

export function articleJsonLd(a: Article) {
  const url = absoluteUrl(a.href);
  const author =
    a.author.name === NEWSROOM
      ? { '@type': 'Organization', name: NEWSROOM, url: `${SITE_URL}/about/` }
      : { '@type': 'Person', name: a.author.name, ...(a.author.slug ? { url: absoluteUrl(`/author/${a.author.slug}/`) } : {}) };
  return [
    {
      '@context': 'https://schema.org',
      '@type': a.isOpinion ? 'OpinionNewsArticle' : 'NewsArticle',
      '@id': `${url}#article`,
      headline: a.title.slice(0, 110),
      description: a.metaDescription,
      image: [a.image || `${SITE_URL}/og-image.jpg`],
      datePublished: a.publishedAt,
      dateModified: a.updatedAt || a.publishedAt,
      author: [author],
      publisher: {
        '@type': 'NewsMediaOrganization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png`, width: 512, height: 512 },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      articleSection: a.category.name,
      ...(a.tags.length ? { keywords: a.tags.join(', ') } : {}),
      ...(a.tldr ? { abstract: a.tldr.join(' ') } : {}),
      ...(a.sources?.length ? { citation: a.sources.map((s) => ({ '@type': 'CreativeWork', name: s.title, url: s.url })) } : {}),
      isAccessibleForFree: true,
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: a.category.name, item: absoluteUrl(categoryHref(a.category.slug)) },
        { '@type': 'ListItem', position: 3, name: a.title, item: url },
      ],
    },
  ];
}
