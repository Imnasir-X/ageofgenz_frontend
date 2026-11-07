import { Navigate, useParams } from 'react-router-dom';
import { SectionPage } from '@/components/news/SectionPage';
import { CATEGORY_LOOKUP, LEGACY_CATEGORY_SLUG_MAP } from '@/constants/categories';
import { SECTIONS, categoryHref, type Section } from '@/constants/sections';

const titleize = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

/** /category/:slug — any backend category, including sub-categories. Legacy slugs redirect. */
export default function Category() {
  const { slug = '' } = useParams<{ slug: string }>();
  const normalized = slug.toLowerCase();
  const legacy = LEGACY_CATEGORY_SLUG_MAP[normalized];
  if (legacy) return <Navigate to={categoryHref(legacy)} replace />;

  const descriptor = CATEGORY_LOOKUP[normalized];
  const known = Object.values(SECTIONS).find((s) => s.category === normalized);
  const name = descriptor?.name ?? titleize(normalized);
  const section: Section = {
    path: `/category/${normalized}/`,
    label: name,
    category: normalized,
    title: name,
    dek: known?.dek ?? `The latest ${name} stories, with the context to understand them.`,
    kind: normalized === 'opinion' ? 'opinion' : undefined,
  };
  return <SectionPage key={normalized} section={section} trail={descriptor?.path} />;
}
