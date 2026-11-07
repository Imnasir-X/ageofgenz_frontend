import { useMemo, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Info, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { request, tokenStore } from '@/lib/api/client';
import { studioApi } from '../api';
import { PageHeader } from '../components/common';
import { Conversation, Message, PromptInput, Response, Suggestion } from '../components/ai/elements';

const SUGGESTIONS = [
  'How did this week compare with last week?',
  'Which articles gained the most views in the last 30 days?',
  'What hour do readers read most?',
  'How much did Hermes cost this month?',
];

type ContextPart = { type: 'data-context'; data: { period: { start: string; end: string; days: number }; sections: string[]; stub: boolean } };

/** fetch with the staff JWT; on 401 let the shared client refresh the token once, then retry. */
const authedFetch: typeof fetch = async (input, init) => {
  const withAuth = (): RequestInit => ({ ...init, headers: { ...(init?.headers as Record<string, string>), Authorization: `Bearer ${tokenStore.access ?? ''}` } });
  let res = await fetch(input, withAuth());
  if (res.status === 401 && tokenStore.refresh) {
    await request('/api/admin/me/').catch(() => undefined);
    res = await fetch(input, withAuth());
  }
  return res;
};

function textOf(m: UIMessage) {
  return m.parts.map((p) => (p.type === 'text' ? p.text : '')).join('');
}

/**
 * Ask-your-data: Vercel AI SDK useChat streaming from the backend proxy (/api/admin/chat/),
 * which adds your stats as context and calls Hermes server-side. The Hermes key never reaches
 * the browser; without HERMES_URL the backend answers with a plain stats summary.
 */
export default function Ask() {
  const [input, setInput] = useState('');
  const transport = useMemo(() => new DefaultChatTransport({ api: studioApi.chatUrl, fetch: authedFetch }), []);
  const { messages, sendMessage, status, stop, error, setMessages, regenerate } = useChat({ transport });
  const busy = status === 'submitted' || status === 'streaming';

  const send = (text: string) => {
    if (!text.trim() || busy) return;
    void sendMessage({ text: text.trim() });
    setInput('');
  };

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] flex-col gap-3 sm:h-[calc(100dvh-9.5rem)]">
      <PageHeader
        title="Ask your data"
        description="Questions are answered from your measured stats only. No forecasts."
        actions={messages.length > 0 && <Button variant="ghost" size="sm" onClick={() => setMessages([])} disabled={busy}><RotateCcw /> New chat</Button>}
      />
      <Conversation className="rounded-lg border bg-background">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <p className="font-display text-xl">What do you want to know?</p>
            <div className="flex max-w-xl flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => <Suggestion key={s} onClick={send}>{s}</Suggestion>)}
            </div>
          </div>
        )}
        {messages.map((m) => {
          const ctx = m.parts.find((p) => p.type === 'data-context') as ContextPart | undefined;
          return (
            <Message key={m.id} from={m.role}>
              {m.role === 'assistant' ? <Response>{textOf(m) || ' '}</Response> : <p className="whitespace-pre-wrap">{textOf(m)}</p>}
              {ctx && (
                <p className="mt-3 flex items-start gap-1.5 border-t border-foreground/10 pt-2 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>
                    {ctx.data.stub ? 'Stub mode, Hermes not connected. ' : ''}
                    From {ctx.data.sections.map((s) => s.replace(/_/g, ' ')).join(', ')} for {ctx.data.period.start} to {ctx.data.period.end}.
                  </span>
                </p>
              )}
            </Message>
          );
        })}
        {status === 'submitted' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Reading your stats</div>
        )}
        {error && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <span>The answer did not come through. {error.message}</span>
            <Button variant="outline" size="sm" onClick={() => regenerate()}>Retry</Button>
          </div>
        )}
      </Conversation>
      <PromptInput value={input} onChange={setInput} onSubmit={() => send(input)} onStop={stop} busy={busy} placeholder="Ask about views, readers, newsletter, donations, Hermes cost..." />
    </div>
  );
}
