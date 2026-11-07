/**
 * Chat building blocks in the style of Vercel AI Elements (Conversation, Message, Response,
 * PromptInput, Suggestion), written against the Studio's shadcn tokens. Shared by the Studio
 * "Ask your data" page; small enough to reuse for other chat surfaces.
 */
import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Conversation({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (el && atBottom) el.scrollTop = el.scrollHeight;
  });
  return (
    <div className={cn('relative min-h-0 flex-1', className)}>
      <div
        ref={ref}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        className="h-full overflow-y-auto px-1 py-4"
        onScroll={(e) => {
          const el = e.currentTarget;
          setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
        }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-5">{children}</div>
      </div>
      {!atBottom && (
        <Button
          variant="outline"
          size="icon-sm"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full shadow-md"
          onClick={() => ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })}
          aria-label="Scroll to latest"
        >
          <ArrowDown />
        </Button>
      )}
    </div>
  );
}

export function Message({ from, children }: { from: 'user' | 'assistant' | 'system'; children: ReactNode }) {
  const user = from === 'user';
  return (
    <div className={cn('flex motion-safe:animate-fade-up', user ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[min(42rem,92%)] rounded-lg px-4 py-3 text-[0.95rem] leading-relaxed',
          user ? 'bg-primary text-primary-foreground' : 'border bg-mist text-mist-foreground',
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Inline **bold** only; everything else is plain text (no HTML is ever injected). */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

/** Streams-friendly renderer for short analytical answers: paragraphs and bullet or numbered lists. */
export function Response({ children }: { children: string }) {
  const blocks = children.replace(/\r/g, '').split(/\n{2,}/);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split('\n').filter((l) => l.trim());
        if (lines.length && lines.every((l) => /^\s*([-*]|\d+[.)])\s+/.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]);
          const Tag = ordered ? 'ol' : 'ul';
          return (
            <Tag key={i} className={cn('space-y-1 pl-5', ordered ? 'list-decimal' : 'list-disc')}>
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*([-*]|\d+[.)])\s+/, ''))}</li>)}
            </Tag>
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {inline(lines.join('\n').replace(/^#+\s*/, ''))}
          </p>
        );
      })}
    </div>
  );
}

export function PromptInput({ value, onChange, onSubmit, onStop, busy, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  busy: boolean;
  placeholder: string;
}) {
  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!busy && value.trim()) onSubmit();
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };
  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-lg border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-ring">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        rows={1}
        placeholder={placeholder}
        aria-label="Ask a question about your data"
        className="max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-2.5 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
      />
      {busy && onStop ? (
        <Button type="button" size="icon" variant="outline" onClick={onStop} aria-label="Stop"><Square /></Button>
      ) : (
        <Button type="submit" size="icon" disabled={!value.trim()} aria-label="Send"><ArrowUp /></Button>
      )}
    </form>
  );
}

export function Suggestion({ children, onClick }: { children: string; onClick: (text: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(children)}
      className="rounded-full border bg-card px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors duration-fast ease-standard hover:border-primary/40 hover:text-foreground"
    >
      {children}
    </button>
  );
}
