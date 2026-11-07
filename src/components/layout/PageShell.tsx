import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '@/components/brand/Logo';
import { Languages } from 'lucide-react';
import { TAGLINE, cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

/** In the Bangla interface, says plainly that this page's text is English only (policy and account pages). */
export function EnglishOnlyNote({ className }: { className?: string }) {
  const { lang, t } = useI18n();
  if (lang !== 'bn') return null;
  return (
    <p lang="bn" className={cn('flex items-center gap-2 rounded-md border bg-mist/60 px-3 py-2 text-sm text-mist-foreground', className)}>
      <Languages className="size-4 shrink-0 text-primary" aria-hidden="true" /> {t('lang.englishOnlyPage')}
    </p>
  );
}

export function PageIntro({ eyebrow, title, dek, className, children }: { eyebrow?: string; title: string; dek?: ReactNode; className?: string; children?: ReactNode }) {
  return (
    <header className={cn('border-b border-foreground pb-8', className)}>
      <EnglishOnlyNote className="mb-5 w-fit" />
      {eyebrow && <p className="eyebrow text-primary">{eyebrow}</p>}
      <h1 className="mt-3 max-w-4xl font-display text-[2.75rem] font-medium leading-[0.98] tracking-[-0.03em] sm:text-[4rem]">{title}</h1>
      {dek && <div className="mt-5 max-w-2xl font-serif text-xl leading-[1.5] text-muted-foreground">{dek}</div>}
      {children}
    </header>
  );
}

/** Two-panel layout for sign-in, sign-up and password flows. */
export function AuthShell({ title, dek, children, footer }: { title: string; dek?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="container grid min-h-[calc(100vh-var(--header-h)-6rem)] gap-10 py-10 sm:py-16 lg:grid-cols-12 lg:items-center">
      <aside className="hidden rounded-lg bg-ink p-10 text-ink-foreground lg:col-span-5 lg:flex lg:min-h-[32rem] lg:flex-col lg:justify-between">
        <Link to="/" aria-label="The Age of GenZ, home">
          <Wordmark inverted />
        </Link>
        <div>
          <p className="font-display text-[2.5rem] font-medium leading-[1.05] tracking-[-0.025em] text-ink-foreground">{TAGLINE}</p>
          <ul className="mt-8 space-y-3 text-sm text-ink-foreground/75">
            <li className="flex gap-3"><span className="data text-ink-foreground/50">01</span> A quick briefing on the stories that matter</li>
            <li className="flex gap-3"><span className="data text-ink-foreground/50">02</span> The original reporting and its sources</li>
            <li className="flex gap-3"><span className="data text-ink-foreground/50">03</span> Follow a story as it develops</li>
          </ul>
        </div>
        <p className="data text-ink-foreground/50">theageofgenz.com</p>
      </aside>
      <div className="mx-auto w-full max-w-md lg:col-span-6 lg:col-start-7">
        <EnglishOnlyNote className="mb-5 w-fit" />
        <h1 className="font-display text-[2.5rem] font-medium leading-[1.02] tracking-[-0.025em]">{title}</h1>
        {dek && <p className="mt-3 text-muted-foreground">{dek}</p>}
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}

export function Field({ id, label, hint, children }: { id: string; label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
