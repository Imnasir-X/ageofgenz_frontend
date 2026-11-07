import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';
import { PRIMARY_NAV, SECTIONS } from '@/constants/sections';
import { useI18n } from '@/lib/i18n/useI18n';

export default function NotFound() {
  const { t, section } = useI18n();
  return (
    <>
      <Seo title="Page not found" description="This page doesn’t exist or has moved." noindex />
      <div className="container grid grid-cols-1 gap-12 py-16 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-primary">{t('notFound.eyebrow')}</p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-7xl">{t('notFound.title')}</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t('notFound.body')}</p>
          <form action="/search/" method="get" role="search" className="mt-8 flex max-w-md gap-2">
            <label htmlFor="nf-q" className="sr-only">
              {t('nav.search')}
            </label>
            <input
              id="nf-q"
              name="q"
              placeholder={t('nav.searchStories')}
              className="h-11 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="lg">
              <Search aria-hidden="true" /> {t('nav.search')}
            </Button>
          </form>
          <Button variant="link" asChild className="mt-6">
            <Link to="/">
              {t('notFound.cta')} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
        <nav aria-label={t('nav.sections')} className="lg:col-span-5">
          <p className="eyebrow">{t('notFound.browse')}</p>
          <ul className="mt-3 divide-y border-y">
            {PRIMARY_NAV.map((key) => (
              <li key={key}>
                <Link to={SECTIONS[key].path} className="flex items-center justify-between py-3 font-display text-lg font-medium hover:text-primary">
                  {section(key).title} <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
