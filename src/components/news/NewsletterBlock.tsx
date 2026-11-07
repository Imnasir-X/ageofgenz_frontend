import { useId } from 'react';
import { NewsletterForm } from './NewsletterForm';
import { cn } from '@/lib/utils';

/** The one newsletter ask on a page (home end, article end). No pre-checked boxes, no urgency. */
export function NewsletterBlock({
  source,
  className,
  title = 'The week’s news, explained in five minutes.',
}: {
  source: string;
  className?: string;
  title?: string;
}) {
  const id = useId();
  return (
    <section id="weekly-briefing" className={cn('scroll-mt-24 grid gap-6 rounded-lg border bg-mist/60 p-7 sm:p-12 lg:grid-cols-12 lg:items-center', className)} aria-labelledby={id}>
      <div className="lg:col-span-7">
        <p className="eyebrow text-primary">The weekly briefing</p>
        <h2 id={id} className="mt-3 font-display text-[2rem] font-medium leading-[1.08] tracking-[-0.02em] sm:text-[2.5rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-xl text-foreground/75">One email with the stories that matter and why. No endless feed. Unsubscribe anytime.</p>
      </div>
      <div className="lg:col-span-5">
        <NewsletterForm source={source} />
      </div>
    </section>
  );
}
