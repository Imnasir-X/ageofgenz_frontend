import { useEffect, useRef, useState } from 'react';
import { Loader2, MessagesSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { aiApi, ApiError } from '@/lib/api/client';
import type { Article } from '@/lib/api/types';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n/useI18n';

interface Turn {
  q: string;
  a?: string;
  quotes?: string[];
  answerable?: boolean;
  error?: string;
}

const SUGGESTIONS = ['ask.s1', 'ask.s2', 'ask.s3'] as const;

/**
 * "Ask about this article". Renders nothing until the backend confirms the Q&A endpoint
 * exists, and removes itself if a question later returns 404.
 */
export function AskPanel({
  article,
  className,
  available: known,
  onUnavailable,
}: {
  article: Article;
  className?: string;
  /** When the parent already checked availability, pass it here to skip a second request. */
  available?: boolean;
  onUnavailable?: () => void;
}) {
  const [checked, setAvailable] = useState(false);
  const available = known ?? checked;
  const { t } = useI18n();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const c = new AbortController();
    setAvailable(false);
    setTurns([]);
    if (known === undefined) aiApi.askAvailable(article.slug, c.signal).then((ok) => !c.signal.aborted && setAvailable(ok));
    return () => {
      c.abort();
      controller.current?.abort();
    };
  }, [article.slug, known]);

  if (!available) return null;

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || busy) return;
    setBusy(true);
    setQuestion('');
    setTurns((t) => [...t, { q: text }]);
    controller.current = new AbortController();
    const settle = (patch: Partial<Turn>) => setTurns((t) => t.map((turn, i) => (i === t.length - 1 ? { ...turn, ...patch } : turn)));
    try {
      const res = await aiApi.ask(article.slug, text, controller.current.signal);
      settle({ a: res.answer || t('ask.noAnswer'), quotes: res.quotes, answerable: res.answerable });
    } catch (err) {
      if (err instanceof ApiError && (err.status === 404 || err.status === 503)) {
        setAvailable(false);
        onUnavailable?.();
        return;
      }
      settle({ error: err instanceof Error ? err.message : t('ask.error') });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="ask" className={cn('rounded-lg bg-mist p-5 text-mist-foreground', className)} aria-labelledby="ask-title">
      <h2 id="ask-title" className="flex items-center gap-2 font-display text-xl font-medium">
        <MessagesSquare className="size-4 text-primary" aria-hidden="true" /> {t('ask.title')}
      </h2>
      <p className="mt-1 text-xs text-mist-foreground/75">{t('ask.note')}</p>

      {turns.length > 0 && (
        <div className="mt-4 max-h-[26rem] space-y-4 overflow-y-auto pr-1" aria-live="polite">
          {turns.map((turn, i) => (
            <div key={i} className="space-y-2 text-sm">
              <p className="font-semibold">{turn.q}</p>
              {turn.a && <p className="whitespace-pre-line leading-relaxed">{turn.a}</p>}
              {turn.error && <p className="text-destructive">{turn.error}</p>}
              {!turn.a && !turn.error && (
                <p className="flex items-center gap-2 text-mist-foreground/70">
                  <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> {t('ask.reading')}
                </p>
              )}
              {turn.quotes && turn.quotes.length > 0 && (
                <ul className="space-y-1.5 border-l-2 border-primary/30 pl-3">
                  {turn.quotes.slice(0, 3).map((q) => (
                    <li key={q} className="text-xs italic leading-relaxed text-mist-foreground/80">
                      “{q}”
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {turns.length === 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((key) => t(key)).map((s) => (
            <button key={s} type="button" onClick={() => ask(s)} className="inline-flex min-h-11 items-center rounded-full border border-primary/25 bg-card px-3 text-left text-xs font-medium transition-colors duration-fast hover:border-primary motion-safe:active:scale-[0.97] sm:min-h-8">
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="mt-4 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void ask(question);
        }}
      >
        <label htmlFor="ask-input" className="sr-only">
          {t('ask.yourQuestion')}
        </label>
        <Textarea
          id="ask-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void ask(question);
            }
          }}
          rows={2}
          maxLength={500}
          placeholder={t('ask.placeholder')}
          className="min-h-[2.75rem] resize-none bg-card"
        />
        <Button type="submit" size="icon" disabled={!question.trim()} loading={busy} aria-label={t('ask.submit')}>
          <Send aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
