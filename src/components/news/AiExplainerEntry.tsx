import { Link } from 'react-router-dom';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import type { Article } from '@/lib/api/types';
import { cn } from '@/lib/utils';

/** Calm Mist Blue entry point to the AI explainer: no glow, no sparkles. */
export function AiExplainerEntry({ article, className }: { article?: Article; className?: string }) {
  const target = article ? `${article.href}#explainer` : '/ai/';
  return (
    <section className={cn('flex h-full flex-col rounded-lg bg-mist p-6 text-mist-foreground sm:p-7', className)} aria-labelledby="ai-explainer-title">
      <p className="eyebrow flex items-center gap-2 text-secondary-foreground">
        <MessagesSquare className="size-3.5" /> AI explainer
      </p>
      <h2 id="ai-explainer-title" className="mt-4 font-display text-[1.6rem] font-medium leading-[1.12] tracking-[-0.015em]">
        Lost the thread? Get the context in a minute.
      </h2>
      <p className="mt-3 text-[0.92rem] leading-relaxed text-mist-foreground/75">
        Every story opens with a short version and the sources behind it. Where it’s switched on, you can ask follow-up questions about
        the article you’re reading.
      </p>
      {article && (
        <p className="mt-5 border-t border-primary/15 pt-4 text-sm">
          <span className="eyebrow mb-1 block">Try it on</span>
          <span className="font-display text-[1.05rem] font-medium leading-snug">{article.title}</span>
        </p>
      )}
      <Link to={target} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-medium text-primary hover:underline">
        Open the explainer <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
