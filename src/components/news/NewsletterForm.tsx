import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { newsletterApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

export function NewsletterForm({ tone = 'light', source = 'site', className }: { tone?: 'light' | 'dark'; source?: string; className?: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const id = `newsletter-${source}`;
  const dark = tone === 'dark';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState('error');
      setMessage('Enter a valid email address.');
      return;
    }
    setState('loading');
    try {
      const res = await newsletterApi.subscribe(email.trim());
      setState('done');
      const msg = res?.already_subscribed ? 'You’re already on the list.' : 'You’re in. Look out for the next briefing.';
      setMessage(msg);
      setEmail('');
      toast(res?.already_subscribed ? 'Already subscribed' : 'Subscribed', { description: msg });
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    }
  };

  return (
    <form onSubmit={submit} className={cn('w-full', className)} noValidate>
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn('sm:flex-1', dark && 'border-ink-foreground/20 bg-ink-foreground/5 text-ink-foreground placeholder:text-ink-foreground/45')}
          aria-describedby={message ? `${id}-msg` : undefined}
          aria-invalid={state === 'error' || undefined}
          disabled={state === 'loading'}
        />
        <Button type="submit" loading={state === 'loading'} className="shrink-0">
          {state === 'done' ? <Check aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}
          Subscribe
        </Button>
      </div>
      {message && (
        <p
          id={`${id}-msg`}
          role="status"
          className={cn('mt-2 text-sm', state === 'error' ? (dark ? 'text-red-300' : 'text-destructive') : dark ? 'text-ink-foreground' : 'text-primary')}
        >
          {message}
        </p>
      )}
    </form>
  );
}
