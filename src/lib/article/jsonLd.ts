import type { Article, Author, AuthorProfile } from '@/lib/api/types';
import { NEWSROOM } from '@/lib/api/normalize';
import { categoryHref } from '@/constants/sections';
import { SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/utils';

const isDesk = (author: Author) => author.isDesk === true || author.name === NEWSROOM;

/** schema.org entity for a byline: the newsroom desk is an Organization, a named author a Person. */
export function authorEntity(author: Author) {
  const url = author.slug ? absoluteUrl(`/author/${author.slug}/`) : isDesk(author) ? `${SITE_URL}/about/` : undefined;
  if (isDesk(author)) return { '@type': 'Organization', name: author.name || NEWSROOM, ...(url ? { url } : {}) };
  return {
    '@type': 'Person',
    name: author.name,
    ...(url ? { url } : {}),
    ...(author.role ? { jobTitle: author.role } : {}),
    ...(author.bio ? { description: author.bio } : {}),
    ...(author.avatar ? { image: author.avatar } : {}),
    worksFor: { '@id': `${SITE_URL}/#organization` },
  };
}

/** /author/<slug>/ : ProfilePage about the author (Person, or the desk as Organization) + breadcrumbs. */
export function authorJsonLd(profile: AuthorProfile) {
  const { author } = profile;
  const url = absoluteUrl(`/author/${author.slug}/`);
  const entity = { ...authorEntity(author), '@id': `${url}#author`, url };
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': url,
      url,
      name: `${author.name} | ${SITE_NAME}`,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: entity,
      ...(profile.articles.length
        ? {
            hasPart: profile.articles.slice(0, 12).map((a) => ({
              '@type': a.isOpinion ? 'OpinionNewsArticle' : 'NewsArticle',
              headline: a.title.slice(0, 110),
              url: absoluteUrl(a.href),
              ...(a.publishedAt ? { datePublished: a.publishedAt } : {}),
            })),
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: author.name, item: url },
      ],
    },
  ];
}

export function articleJsonLd(a: Article) {
  const url = absoluteUrl(a.href);
  const author = authorEntity(a.author);
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
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/icons/logo-1024.png`, width: 1024, height: 1024 },
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
