import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { PageIntro } from '@/components/layout/PageShell';
import { Button } from '@/components/ui/button';
import { PRIMARY_NAV, SECTIONS } from '@/constants/sections';
import { SITE_URL, TAGLINE } from '@/lib/utils';

const STANDARDS = [
  { t: 'Fact first', d: 'We verify before we publish, and we say what we don’t know yet.' },
  { t: 'Sources you can check', d: 'Stories link to the reporting and documents they rely on.' },
  { t: 'Opinion is labelled', d: 'Arguments live in Opinion and are marked as such, every time.' },
  { t: 'Corrections in the open', d: 'When we get something wrong, we fix it and say so.' },
];

export default function About() {
  return (
    <>
      <Seo
        title="About us"
        description="The Age of GenZ is a youth-focused news platform from Dhaka, Bangladesh, built to help people understand the news that matters."
        path="/about/"
        jsonLd={{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'About The Age of GenZ', url: `${SITE_URL}/about/` }}
      />
      <div className="container pt-8 sm:pt-12">
        <PageIntro eyebrow="About us" title={TAGLINE} dek="Don’t make people scroll through more news. Help them understand the news that matters." />

        <div className="mt-12 grid gap-12 lg:grid-cols-12">
          <div className="article-body lg:col-span-7">
            <p>
              The Age of GenZ started in 2025 in Dhaka, Bangladesh. Most young people now meet the news in feeds and short videos, in fragments,
              without the context to tell what matters. We want to fix that.
            </p>
            <p>
              Every story opens with the short version, links to the original reporting, and separates fact from argument. Where it helps, an AI
              explainer answers your follow-up questions about the story in front of you, and points you back to the sources.
            </p>
            <p>
              We cover technology and AI, politics, world affairs with a focus on South Asia, business, science, culture and sport, for readers
              in Bangladesh and around the world.
            </p>
            <h2>Who we are</h2>
            <p>
              <strong>Nasir Khan</strong>, founder and editor-in-chief, is an Information and Communications Engineering graduate of East West
              University. <strong>Imran Khan</strong> is co-founder.
            </p>
          </div>
          <aside className="space-y-6 lg:col-span-5">
            <section className="rounded-lg border bg-card p-6" aria-labelledby="standards">
              <h2 id="standards" className="font-display text-2xl font-medium">
                Our standards
              </h2>
              <ol className="mt-4 divide-y">
                {STANDARDS.map((s, i) => (
                  <li key={s.t} className="flex gap-4 py-3">
                    <span className="data pt-1 text-primary">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="font-medium">{s.t}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
            <section className="rounded-lg bg-ink p-6 text-ink-foreground">
              <p className="eyebrow text-lime">Quick facts</p>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="data text-ink-foreground/55">Founded</dt>
                  <dd className="mt-1 font-display text-xl">2025</dd>
                </div>
                <div>
                  <dt className="data text-ink-foreground/55">Based in</dt>
                  <dd className="mt-1 font-display text-xl">Dhaka</dd>
                </div>
                <div>
                  <dt className="data text-ink-foreground/55">Coverage</dt>
                  <dd className="mt-1 font-display text-xl">Global</dd>
                </div>
                <div>
                  <dt className="data text-ink-foreground/55">Readers</dt>
                  <dd className="mt-1 font-display text-xl">18–35+</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <section className="mt-16 border-t border-foreground pt-8" aria-label="Sections">
          <p className="eyebrow">What we cover</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PRIMARY_NAV.map((k) => (
              <li key={k}>
                <Link to={SECTIONS[k].path} className="inline-block rounded-full border bg-card px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary">
                  {SECTIONS[k].title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/contact">
                Contact the newsroom <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/donate">Support our journalism</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
