import { afterEach, describe, expect, it, vi } from 'vitest';
import { articlesApi, newsletterApi, subscriptionApi, aiApi } from '@/lib/api/client';

const calls: { url: string; init?: RequestInit }[] = [];

function mockFetch(status = 200, body: unknown = {}) {
  calls.length = 0;
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('API client paths match the Django backend', () => {
  it('lists articles without the ignored page_size parameter', async () => {
    mockFetch(200, { count: 0, next: null, previous: null, results: [] });
    await articlesApi.list({ page: 2, category: 'tech' });
    const url = new URL(calls[0].url);
    expect(url.pathname).toBe('/api/articles/');
    expect(url.searchParams.get('category__slug')).toBe('tech');
    expect(url.searchParams.has('page_size')).toBe(false);
  });

  it('unsubscribes via POST /api/newsletter/unsubscribe/ with a body, not an id in the path', async () => {
    mockFetch(200, { message: 'ok' });
    await newsletterApi.unsubscribe({ email: 'a@b.co' });
    expect(new URL(calls[0].url).pathname).toBe('/api/newsletter/unsubscribe/');
    expect(calls[0].init?.method).toBe('POST');
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ email: 'a@b.co' });
  });

  it('starts subscription checkout under /api/subscription/subscriptions/', async () => {
    mockFetch(200, { checkout_url: 'https://checkout.stripe.com/x' });
    await subscriptionApi.createCheckout(3, false);
    expect(new URL(calls[0].url).pathname).toBe('/api/subscription/subscriptions/create_checkout/');
    expect(JSON.parse(String(calls[0].init?.body)).consent_opt_in).toBe(false);
  });

  it('hides optional AI features when the endpoint 404s', async () => {
    mockFetch(404, { detail: 'Not found.' });
    expect(await aiApi.brief('x')).toBeNull();
    expect(await aiApi.translate('x')).toBeNull();
    expect(await aiApi.related('x')).toBeNull();
    expect(await aiApi.askAvailable('x')).toBe(false);
  });

  it('treats a 405 on the ask endpoint as available (POST-only view)', async () => {
    mockFetch(405, { detail: 'Method "GET" not allowed.' });
    expect(await aiApi.askAvailable('x')).toBe(true);
  });

  it('calls the Hermes newsroom routes on backend master', async () => {
    mockFetch(200, { id: 1, slug: 'x', title: 'X', tldr: 'One\nTwo', why_it_matters: 'Because.' });
    expect(await aiApi.brief('x')).toEqual({ tldr: ['One', 'Two'], whyItMatters: 'Because.' });
    expect(new URL(calls[0].url).pathname).toBe('/api/newsroom/articles/x/summary/');

    mockFetch(200, { article_slug: 'x', language: 'bn', title: 'শিরোনাম', tldr: 'এক', is_approved: true });
    expect(await aiApi.translate('x')).toEqual({ title: 'শিরোনাম', tldr: ['এক'] });
    expect(new URL(calls[0].url).pathname).toBe('/api/newsroom/articles/x/translations/bn/');

    mockFetch(200, { question: 'q', answer: 'A.', answerable: true, quotes: ['Quoted.'], grounded_on: 'x', ai_generated: true });
    expect(await aiApi.ask('x', 'q')).toEqual({ answer: 'A.', answerable: true, quotes: ['Quoted.'] });
    expect(new URL(calls[0].url).pathname).toBe('/api/newsroom/articles/x/ask/');
    expect(calls[0].init?.method).toBe('POST');

    mockFetch(200, [{ id: 2, title: 'Y', slug: 'y', excerpt: '', tldr: '', category: 'tech', published_at: null, featured_image_url: null }]);
    const related = await aiApi.related('x');
    expect(new URL(calls[0].url).pathname).toBe('/api/newsroom/articles/x/related/');
    expect(related?.[0].slug).toBe('y');
    expect(related?.[0].category.slug).toBe('tech');
  });

  it('confirms password reset with uid, token and password', async () => {
    mockFetch(200, { message: 'ok' });
    const { authApi } = await import('@/lib/api/client');
    await authApi.confirmPasswordReset('MQ', 'tok', 'n3w-Passw0rd!');
    expect(new URL(calls[0].url).pathname).toBe('/api/auth/password-reset/confirm/');
    expect(JSON.parse(String(calls[0].init?.body))).toEqual({ uid: 'MQ', token: 'tok', password: 'n3w-Passw0rd!' });
  });
});
