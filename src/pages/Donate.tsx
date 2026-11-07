import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { PageIntro } from '@/components/layout/PageShell';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { donationApi } from '@/lib/api/client';
import { cn } from '@/lib/utils';

const AMOUNTS = [5, 10, 25, 50];

export default function Donate() {
  const { user } = useAuth();
  const [recurring, setRecurring] = useState(false);
  const [amount, setAmount] = useState(10);
  const [custom, setCustom] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const value = custom ? Number(custom) : amount;

  const donate = async () => {
    setError('');
    if (!Number.isFinite(value) || value < 1 || value > 10000) return setError('Choose an amount between $1 and $10,000.');
    setBusy(true);
    try {
      const res = await donationApi.createCheckout({ amount: Math.round(value * 100) / 100, recurring, email: user?.email });
      const url = res.url || res.checkout_url;
      if (!url) throw new Error('Checkout is unavailable right now.');
      window.location.assign(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t start checkout.');
      setBusy(false);
    }
  };

  return (
    <>
      <Seo title="Support our journalism" description="Support The Age of GenZ with a one-off or monthly contribution." path="/donate/" />
      <div className="container pt-8 sm:pt-12">
        <PageIntro eyebrow="Support us" title="Keep the news clear, and free to read." dek="Every contribution funds reporting that explains instead of shouts. No paywall on the stories that matter." />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <section className="rounded-lg border bg-card p-6 sm:p-8 lg:col-span-7" aria-label="Donation">
            <div role="radiogroup" aria-label="Frequency" className="inline-flex rounded-md border p-1">
              {[
                { v: false, l: 'One-off' },
                { v: true, l: 'Monthly' },
              ].map((o) => (
                <button
                  key={o.l}
                  type="button"
                  role="radio"
                  aria-checked={recurring === o.v}
                  onClick={() => setRecurring(o.v)}
                  className={cn('rounded px-4 py-1.5 text-sm font-medium', recurring === o.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}
                >
                  {o.l}
                </button>
              ))}
            </div>
            <div role="radiogroup" aria-label="Amount" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  role="radio"
                  aria-checked={!custom && amount === a}
                  onClick={() => {
                    setAmount(a);
                    setCustom('');
                  }}
                  className={cn(
                    'rounded-md border py-4 font-display text-2xl font-medium transition-colors',
                    !custom && amount === a ? 'border-primary bg-mist text-secondary-foreground' : 'hover:border-foreground/40',
                  )}
                >
                  ${a}
                </button>
              ))}
            </div>
            <label htmlFor="donate-custom" className="mt-6 block text-sm font-medium">
              Or enter an amount (USD)
            </label>
            <Input id="donate-custom" inputMode="decimal" placeholder="e.g. 15" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ''))} className="mt-2 max-w-[12rem]" />
            {error && (
              <Alert variant="destructive" className="mt-5">
                {error}
              </Alert>
            )}
            <Button size="lg" className="mt-8 w-full sm:w-auto" onClick={donate} loading={busy}>
              <Heart aria-hidden="true" /> Give ${Number.isFinite(value) ? value : 0}
              {recurring ? ' a month' : ''}
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">Secure checkout by Stripe. Monthly gifts can be cancelled anytime.</p>
          </section>
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-lg bg-ink p-7 text-ink-foreground">
              <p className="eyebrow text-lime">Where it goes</p>
              <ul className="mt-4 space-y-4 text-sm text-ink-foreground/80">
                <li className="flex gap-3"><span className="data text-ink-foreground/50">01</span> Reporting and fact-checking time</li>
                <li className="flex gap-3"><span className="data text-ink-foreground/50">02</span> Explainers and source lists on every story</li>
                <li className="flex gap-3"><span className="data text-ink-foreground/50">03</span> Keeping the site fast, accessible and free to read</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
