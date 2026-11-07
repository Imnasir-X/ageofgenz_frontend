import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { PageIntro } from '@/components/layout/PageShell';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsletterForm } from '@/components/news/NewsletterForm';
import { useAuth } from '@/context/AuthContext';
import { subscriptionApi } from '@/lib/api/client';
import type { SubscriptionPlan, UserSubscription } from '@/lib/api/types';
import { cn, formatDate } from '@/lib/utils';

const priceOf = (p: SubscriptionPlan) => Number(p.amount ?? p.price ?? 0);
const intervalOf = (p: SubscriptionPlan) => p.interval || (p.billing_cycle === 'yearly' ? 'year' : 'month');

function features(p: SubscriptionPlan): string[] {
  const list: string[] = [];
  if (p.has_ad_free_experience) list.push('Ad-free reading');
  if (p.has_premium_content) list.push('Premium explainers and deep dives');
  if (p.has_newsletter_access) list.push('Subscriber newsletters');
  if (p.has_early_access) list.push('Early access to new features');
  if (!list.length) list.push('Support independent youth journalism');
  return list;
}

export default function Subscribe() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlan[] | null>(null);
  const [current, setCurrent] = useState<UserSubscription | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    subscriptionApi
      .plans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const loadCurrent = useCallback(() => {
    if (!isAuthenticated) return;
    subscriptionApi
      .current()
      .then(setCurrent)
      .catch(() => setCurrent(null));
  }, [isAuthenticated]);
  useEffect(loadCurrent, [loadCurrent]);

  const checkout = useCallback(
    async (planId: string) => {
      setError('');
      if (!isAuthenticated) {
        sessionStorage.setItem('subscriptionIntent', planId);
        navigate('/login');
        return;
      }
      setPending(planId);
      try {
        const res = await subscriptionApi.createCheckout(planId);
        const url = res.checkout_url || res.url;
        if (!url) throw new Error('Checkout is unavailable right now.');
        window.location.assign(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Couldn’t start checkout.');
        setPending(null);
      }
    },
    [isAuthenticated, navigate],
  );

  // Resume a checkout that was interrupted by sign-in.
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const intent = sessionStorage.getItem('subscriptionIntent');
    if (intent) {
      sessionStorage.removeItem('subscriptionIntent');
      void checkout(intent);
    }
  }, [isAuthenticated, isLoading, checkout]);

  const manage = async (action: 'cancel' | 'reactivate') => {
    if (!current) return;
    if (action === 'cancel' && !window.confirm('Cancel your subscription? You keep access until the end of the billing period.')) return;
    setPending(action);
    setError('');
    try {
      await (action === 'cancel' ? subscriptionApi.cancel(current.id) : subscriptionApi.reactivate(current.id));
      setNotice(action === 'cancel' ? 'Your subscription will end at the close of this billing period.' : 'Your subscription is active again.');
      loadCurrent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That didn’t work. Try again.');
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <Seo title="Subscribe" description="Support The Age of GenZ and get more from every story." path="/subscribe/" />
      <div className="container pt-8 sm:pt-12">
        <PageIntro
          eyebrow="Subscribe"
          title="Pay for understanding, not more noise."
          dek="Reader support keeps The Age of GenZ independent, ad-light and focused on the stories that matter."
        />
        {error && (
          <Alert variant="destructive" className="mt-6">
            {error}
          </Alert>
        )}
        {notice && (
          <Alert variant="success" className="mt-6">
            {notice}
          </Alert>
        )}

        {current && current.status && (
          <section className="mt-8 flex flex-col gap-4 rounded-lg border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Your subscription</p>
              <p className="mt-1 font-display text-2xl font-medium capitalize">
                {current.plan_name || 'Subscriber'} · {current.status}
              </p>
              {current.current_period_end && (
                <p className="data mt-1 text-muted-foreground">
                  {current.cancel_at_period_end ? 'Ends' : 'Renews'} {formatDate(current.current_period_end, { month: 'long' })}
                </p>
              )}
            </div>
            {current.cancel_at_period_end ? (
              <Button onClick={() => manage('reactivate')} disabled={pending !== null} loading={pending === 'reactivate'}>
                Reactivate
              </Button>
            ) : (
              <Button variant="outline" onClick={() => manage('cancel')} disabled={pending !== null} loading={pending === 'cancel'}>
                Cancel subscription
              </Button>
            )}
          </section>
        )}

        <section className="mt-10" aria-label="Plans">
          {plans === null ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-72" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="grid gap-6 rounded-lg border bg-card p-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <p className="font-display text-2xl font-medium">Paid plans are on their way.</p>
                <p className="mt-2 text-muted-foreground">
                  Until then, the best support is reading, sharing, and getting the weekly briefing. You can also{' '}
                  <Link to="/donate" className="link-underline text-primary">
                    make a one-off contribution
                  </Link>
                  .
                </p>
              </div>
              <NewsletterForm source="subscribe-empty" className="lg:col-span-5" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => {
                const id = String(plan.id);
                return (
                  <article key={id} className={cn('flex flex-col rounded-lg border bg-card p-6', plan.is_popular && 'border-primary ring-1 ring-primary')}>
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-display text-2xl font-medium">{plan.name}</h2>
                      {plan.is_popular && <Badge>Most popular</Badge>}
                    </div>
                    {plan.description && <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>}
                    <p className="mt-6">
                      <span className="font-display text-5xl font-medium tracking-tight">${priceOf(plan).toFixed(priceOf(plan) % 1 ? 2 : 0)}</span>
                      <span className="data ml-1 text-muted-foreground">/ {intervalOf(plan)}</span>
                    </p>
                    <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                      {features(plan).map((f) => (
                        <li key={f} className="flex gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button className="mt-8 w-full" variant={plan.is_popular ? 'default' : 'outline'} onClick={() => checkout(id)} disabled={pending !== null} loading={pending === id}>
                      {isAuthenticated ? 'Continue to checkout' : 'Sign in to subscribe'}
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
        <p className="mt-8 text-sm text-muted-foreground">
          Payments are processed securely by Stripe. Prefer a one-off gift?{' '}
          <Link to="/donate" className="link-underline text-primary">
            Support us with a donation
          </Link>
          .
        </p>
      </div>
    </>
  );
}
