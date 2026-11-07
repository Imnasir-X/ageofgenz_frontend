import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Logo';
import { PRIMARY_NAV, SECONDARY_NAV, SECTIONS } from '@/constants/sections';
import { CONTACT_EMAIL, TAGLINE } from '@/lib/utils';

const SOCIAL = [
  { label: 'X', href: 'https://twitter.com/TheAgeOfGenZ' },
  { label: 'Instagram', href: 'https://instagram.com/theageofgenz' },
  { label: 'Facebook', href: 'https://facebook.com/theageofgenz' },
  { label: 'YouTube', href: 'https://youtube.com/@theageofgenz' },
];

const linkCls = 'text-ink-foreground/80 underline-offset-4 transition-colors duration-fast hover:text-ink-foreground hover:underline';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="container grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Wordmark inverted />
          <p className="mt-5 max-w-sm font-display text-[1.75rem] font-medium leading-[1.15] tracking-[-0.015em] text-ink-foreground">{TAGLINE}</p>
          <p className="mt-3 max-w-sm text-sm text-ink-foreground/65">
            Fewer feeds, more understanding: a quick briefing, the original reporting and the context behind it.
          </p>
          <p className="mt-6">
            <Link to="/#weekly-briefing" className="text-sm font-medium text-ink-foreground underline decoration-ink-foreground/40 underline-offset-4 hover:decoration-ink-foreground">
              Get the weekly briefing
            </Link>
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
          <div>
            <p className="eyebrow text-ink-foreground/50">Sections</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {PRIMARY_NAV.map((key) => (
                <li key={key}>
                  <Link className={linkCls} to={SECTIONS[key].path}>
                    {SECTIONS[key].title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-ink-foreground/50">More</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {SECONDARY_NAV.map((key) => (
                <li key={key}>
                  <Link className={linkCls} to={SECTIONS[key].path}>
                    {SECTIONS[key].title}
                  </Link>
                </li>
              ))}
              <li>
                <Link className={linkCls} to="/search">
                  Search
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-ink-foreground/50">The Age of GenZ</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link className={linkCls} to="/about">About us</Link></li>
              <li><Link className={linkCls} to="/editorial-policy">Editorial policy</Link></li>
              <li><Link className={linkCls} to="/corrections">Corrections</Link></li>
              <li><Link className={linkCls} to="/contact">Contact</Link></li>
              <li><Link className={linkCls} to="/subscribe">Subscribe</Link></li>
              <li><Link className={linkCls} to="/donate">Support us</Link></li>
              <li><Link className={linkCls} to="/privacy">Privacy</Link></li>
              <li><Link className={linkCls} to="/terms">Terms</Link></li>
              <li><a className={linkCls} href="/rss.xml">RSS feed</a></li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="border-t border-ink-foreground/10">
        <div className="container flex flex-col gap-3 py-6 text-xs text-ink-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <p className="data">© {year} The Age of GenZ</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="underline-offset-4 transition-colors duration-fast hover:text-ink-foreground hover:underline">
                {s.label}
              </a>
            ))}
            <a href={`mailto:${CONTACT_EMAIL}`} className="underline-offset-4 transition-colors duration-fast hover:text-ink-foreground hover:underline">
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
