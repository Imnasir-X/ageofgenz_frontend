import { Link } from 'react-router-dom';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

/** Calm Mist Blue entry point to the AI explainer: no glow, no sparkles. */
export function AiExplainerEntry({ article, className }: { article?: Article; className?: string }) {
  const { t } = useI18n();
  const target = article ? `${article.href}#explainer` : '/ai/';
  return (
    <section className={cn('flex h-full flex-col rounded-lg bg-mist p-6 text-mist-foreground sm:p-7', className)} aria-labelledby="ai-explainer-title">
      <p className="eyebrow flex items-center gap-2 text-secondary-foreground">
        <MessagesSquare className="size-3.5" aria-hidden="true" /> {t('explainer.eyebrow')}
      </p>
      <h2 id="ai-explainer-title" className="mt-4 font-display text-[1.6rem] font-medium leading-[1.12] tracking-[-0.015em]">
        {t('explainer.title')}
      </h2>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-mist-foreground/75">
        {t('explainer.body')}
      </p>
      {article && (
        <p className="mt-5 border-t border-primary/15 pt-4 text-sm">
          <span className="eyebrow mb-1 block">{t('explainer.tryOn')}</span>
          <span className="font-display text-[1.05rem] font-medium leading-snug">{article.title}</span>
        </p>
      )}
      <Link to={target} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary hover:underline">
        {t('explainer.open')} <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
