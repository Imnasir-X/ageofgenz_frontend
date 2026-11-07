import { useId } from 'react';
import { NewsletterForm } from './NewsletterForm';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

/** The one newsletter ask on a page (home end, article end). No pre-checked boxes, no urgency. */
export function NewsletterBlock({
  source,
  className,
  title,
}: {
  source: string;
  className?: string;
  title?: string;
}) {
  const id = useId();
  const { t } = useI18n();
  return (
    <section id="weekly-briefing" className={cn('scroll-mt-24 grid gap-6 rounded-lg border bg-mist/60 p-7 sm:p-12 lg:grid-cols-12 lg:items-center', className)} aria-labelledby={id}>
      <div className="lg:col-span-7">
        <p className="eyebrow text-primary">{t('newsletter.eyebrow')}</p>
        <h2 id={id} className="mt-3 font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
          {title ?? t('newsletter.title')}
        </h2>
        <p className="mt-3 max-w-xl text-foreground/75">{t('newsletter.body')}</p>
      </div>
      <div className="lg:col-span-5">
        <NewsletterForm source={source} />
      </div>
    </section>
  );
}
