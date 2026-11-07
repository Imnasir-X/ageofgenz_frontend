import { splitHighlight } from '@/lib/search/highlight';

/** Marks query words inside a title. Mist Blue background, not lime: lime is reserved for a single emphasis per view. */
export function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitHighlight(text, query).map((s, i) =>
        s.match ? (
          <mark key={i} className="rounded-sm bg-mist px-0.5 text-foreground">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
