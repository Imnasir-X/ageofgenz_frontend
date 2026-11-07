import { useEffect, useRef, useState } from 'react';
import { Loader2, MessagesSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { aiApi, ApiError } from '@/lib/api/client';
import type { Article, ArticleSource } from '@/lib/api/types';
import { cn } from '@/lib/utils';

interface Turn {
  q: string;
  a?: string;
  sources?: ArticleSource[];
  error?: string;
}

const SUGGESTIONS = ['What happened, in one paragraph?', 'Why does this matter to me?', 'What should I watch for next?'];

/**
 * "Ask about this article". Renders nothing until the backend confirms the Q&A endpoint
 * exists, and removes itself if a question later returns 404.
 */
export function AskPanel({ article, className }: { article: Article; className?: string }) {
  const [available, setAvailable] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const c = new AbortController();
    setAvailable(false);
    setTurns([]);
    aiApi.askAvailable(article.slug, c.signal).then((ok) => !c.signal.aborted && setAvailable(ok));
    return () => {
      c.abort();
      controller.current?.abort();
    };
  }, [article.slug]);

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
      settle({ a: res.answer || 'No answer this time.', sources: res.sources });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setAvailable(false);
        return;
      }
      settle({ error: err instanceof Error ? err.message : 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="ask" className={cn('rounded-lg bg-mist p-5 text-mist-foreground', className)} aria-labelledby="ask-title">
      <h2 id="ask-title" className="flex items-center gap-2 font-display text-xl font-medium">
        <MessagesSquare className="size-4 text-primary" /> Ask about this article
      </h2>
      <p className="mt-1 text-xs text-mist-foreground/75">Answers draw on this story and its sources. AI can make mistakes, so check the sources.</p>

      {turns.length > 0 && (
        <div className="mt-4 max-h-[26rem] space-y-4 overflow-y-auto pr-1" aria-live="polite">
          {turns.map((turn, i) => (
            <div key={i} className="space-y-2 text-sm">
              <p className="font-semibold">{turn.q}</p>
              {turn.a && <p className="whitespace-pre-line leading-relaxed">{turn.a}</p>}
              {turn.error && <p className="text-destructive">{turn.error}</p>}
              {!turn.a && !turn.error && (
                <p className="flex items-center gap-2 text-mist-foreground/70">
                  <Loader2 className="size-3.5 animate-spin" /> Reading the article…
                </p>
              )}
              {turn.sources && turn.sources.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {turn.sources.slice(0, 4).map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="rounded-full bg-card px-2.5 py-1 text-xs text-primary hover:underline">
                        {s.publisher || s.title}
                      </a>
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
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-primary/25 bg-card px-3 py-1.5 text-left text-xs font-medium hover:border-primary">
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
          Your question
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
          placeholder="Ask a question about this story"
          className="min-h-[2.75rem] resize-none bg-card"
        />
        <Button type="submit" size="icon" disabled={busy || !question.trim()} aria-label="Ask">
          {busy ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </form>
    </section>
  );
}
