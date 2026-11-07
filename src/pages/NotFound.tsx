import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { Button } from '@/components/ui/button';
import { PRIMARY_NAV, SECTIONS } from '@/constants/sections';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="This page doesn’t exist or has moved." noindex />
      <div className="container grid gap-12 py-16 sm:py-24 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-primary">Error 404</p>
          <h1 className="mt-4 font-display text-5xl font-medium leading-[1.02] tracking-[-0.025em] sm:text-7xl">This story isn’t here.</h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">The link may be old, or the page may have moved. Try a search, or start from today’s briefing.</p>
          <form action="/search/" method="get" role="search" className="mt-8 flex max-w-md gap-2">
            <label htmlFor="nf-q" className="sr-only">
              Search
            </label>
            <input
              id="nf-q"
              name="q"
              placeholder="Search stories"
              className="h-11 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button type="submit" size="lg">
              <Search /> Search
            </Button>
          </form>
          <Button variant="link" asChild className="mt-6">
            <Link to="/">
              Today’s briefing <ArrowRight />
            </Link>
          </Button>
        </div>
        <nav aria-label="Sections" className="lg:col-span-5">
          <p className="eyebrow">Or browse a section</p>
          <ul className="mt-3 divide-y border-y">
            {PRIMARY_NAV.map((key) => (
              <li key={key}>
                <Link to={SECTIONS[key].path} className="flex items-center justify-between py-3 font-display text-lg font-medium hover:text-primary">
                  {SECTIONS[key].title} <ArrowRight className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
