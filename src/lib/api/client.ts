/**
 * The single typed API client for The Age of GenZ.
 *
 * Every network call in the app goes through this file. Paths match the Django
 * backend (Imnasir-X/ageofgenz_backend). AI endpoints are optional: when the
 * backend does not expose them (404/405/5xx/network), the helpers resolve to
 * `null` and the UI hides the feature instead of erroring.
 */
import { normalizeArticle, normalizeList } from './normalize';
import type {
  Article,
  AskResponse,
  AuthUser,
  Category,
  CheckoutResponse,
  LoginResponse,
  RegisterPayload,
  SubscriptionPlan,
  UserSubscription,
} from './types';

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};

export const API_BASE_URL = (env.VITE_API_URL || 'https://ageofgenz-backend.onrender.com').replace(/\/$/, '');

/** Backend default page size (PageNumberPagination PAGE_SIZE). `page_size` is not honoured server-side, so we never send it. */
export const PAGE_SIZE = 12;

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type Params = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  params?: Params;
  body?: unknown;
  signal?: AbortSignal;
  /** Retries for network errors / 5xx (default 2 for GET, 0 otherwise). */
  retries?: number;
  /** Skip the Authorization header. */
  anonymous?: boolean;
  timeoutMs?: number;
}

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const tokenStore = {
  get access() {
    return hasStorage() ? window.localStorage.getItem('token') : null;
  },
  get refresh() {
    return hasStorage() ? window.localStorage.getItem('refresh') : null;
  },
  set(access: string, refresh?: string) {
    if (!hasStorage()) return;
    window.localStorage.setItem('token', access);
    if (refresh) window.localStorage.setItem('refresh', refresh);
  },
  clear() {
    if (!hasStorage()) return;
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('refresh');
    window.localStorage.removeItem('user');
  },
};

export const buildUrl = (path: string, params?: Params): string => {
  const url = new URL(path.startsWith('http') ? path : `${API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

const errorMessage = (data: unknown, fallback: string): string => {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    for (const key of ['detail', 'error', 'message', 'non_field_errors', 'email', 'username', 'password']) {
      const v = d[key];
      if (typeof v === 'string' && v) return v;
      if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
    }
  }
  return fallback;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let refreshing: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = tokenStore.refresh;
  if (!refresh) return null;
  if (!refreshing) {
    refreshing = fetch(buildUrl('/api/token/refresh/'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { access?: string };
        if (!data.access) return null;
        tokenStore.set(data.access);
        return data.access;
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', params, body, signal, anonymous = false, timeoutMs = 20000 } = opts;
  const retries = opts.retries ?? (method === 'GET' ? 2 : 0);

  const run = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (token && !anonymous) headers.Authorization = `Bearer ${token}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    signal?.addEventListener('abort', onAbort);
    try {
      return await fetch(buildUrl(path, params), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener('abort', onAbort);
    }
  };

  let attempt = 0;
  for (;;) {
    try {
      let res = await run(tokenStore.access);
      if (res.status === 401 && !anonymous && tokenStore.refresh) {
        const fresh = await refreshAccessToken();
        if (fresh) res = await run(fresh);
        else tokenStore.clear();
      }
      const text = await res.text();
      let data: unknown = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
      if (!res.ok) throw new ApiError(errorMessage(data, `Request failed (${res.status})`), res.status, data);
      return data as T;
    } catch (err) {
      if (signal?.aborted) throw err;
      const retryable = !(err instanceof ApiError) || err.status >= 500;
      if (retryable && attempt < retries) {
        attempt += 1;
        await sleep(400 * 2 ** attempt);
        continue;
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError('Network error. Check your connection and try again.', 0, null);
    }
  }
}

/** Resolve to null instead of throwing: used for optional endpoints. */
async function optional<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Articles & categories
// ---------------------------------------------------------------------------

export interface ListParams {
  page?: number;
  category?: string;
  search?: string;
  signal?: AbortSignal;
}

export const articlesApi = {
  async list({ page = 1, category, search, signal }: ListParams = {}) {
    const data = await request<unknown>('/api/articles/', {
      params: { page, category__slug: category, include_subs: category ? 'true' : undefined, search },
      signal,
    });
    return normalizeList(data);
  },

  async latest(signal?: AbortSignal): Promise<Article[]> {
    try {
      return normalizeList(await request<unknown>('/api/articles/latest/', { signal })).results;
    } catch (err) {
      if (signal?.aborted) throw err;
      return (await articlesApi.list({ signal })).results;
    }
  },

  async bySlug(slug: string, signal?: AbortSignal): Promise<Article> {
    const data = await request<unknown>(`/api/articles/${encodeURIComponent(slug)}/`, {
      params: { include_blocks: '1' },
      signal,
    });
    return normalizeArticle(data);
  },

  async slugs(): Promise<string[]> {
    const data = await request<{ slugs?: string[] }>('/api/articles/slugs/');
    return Array.isArray(data?.slugs) ? data.slugs : [];
  },

  /** AI-related stories when available, else same-category, topped up with latest. */
  async related(article: Article, signal?: AbortSignal): Promise<Article[]> {
    const fromAi = await aiApi.related(article.slug, signal);
    if (fromAi && fromAi.length) return fromAi.filter((a) => a.slug !== article.slug).slice(0, 4);
    const inCategory = await optional(articlesApi.list({ category: article.category.slug, signal }));
    let pool = (inCategory?.results ?? []).filter((a) => a.slug !== article.slug);
    if (pool.length < 3) {
      const latest = await optional(articlesApi.latest(signal));
      const seen = new Set(pool.map((a) => a.slug));
      pool = pool.concat((latest ?? []).filter((a) => a.slug !== article.slug && !seen.has(a.slug)));
    }
    return pool.slice(0, 4);
  },
};

/** Server-built home feed (backend /api/home/). Null when the endpoint is not deployed or fails. */
export interface HomeFeed {
  lead?: Article;
  secondary: Article[];
  briefing: Article[];
  trending: Article[];
  sections: { key: string; label: string; categorySlug: string | null; articles: Article[] }[];
  latestPublishedAt: string | null;
}

const asList = (v: unknown): Article[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object').map(normalizeArticle) : []);

export function parseHomeFeed(data: unknown): HomeFeed | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;
  if (!('secondary' in d) || !Array.isArray(d.secondary)) return null;
  const freshness = (d.freshness && typeof d.freshness === 'object' ? d.freshness : {}) as Record<string, unknown>;
  const sections = Array.isArray(d.sections)
    ? d.sections
        .filter((s): s is Record<string, unknown> => Boolean(s) && typeof s === 'object')
        .map((s) => ({
          key: typeof s.key === 'string' ? s.key : '',
          label: typeof s.label === 'string' ? s.label : '',
          categorySlug: typeof s.category_slug === 'string' ? s.category_slug : null,
          articles: asList(s.articles),
        }))
    : [];
  return {
    lead: d.lead && typeof d.lead === 'object' ? normalizeArticle(d.lead) : undefined,
    secondary: asList(d.secondary),
    briefing: asList(d.briefing),
    trending: asList(d.trending),
    sections,
    latestPublishedAt: typeof freshness.latest_published_at === 'string' ? freshness.latest_published_at : null,
  };
}

export const homeApi = {
  async feed(signal?: AbortSignal): Promise<HomeFeed | null> {
    try {
      return parseHomeFeed(await request<unknown>('/api/home/', { signal, retries: 0, timeoutMs: 12000 }));
    } catch (err) {
      if (signal?.aborted) throw err;
      return null;
    }
  },
};

export const categoriesApi = {
  async list(signal?: AbortSignal): Promise<Category[]> {
    const data = await request<Category[] | { results?: Category[] }>('/api/categories/', { params: { flat: 'true' }, signal });
    return Array.isArray(data) ? data : data?.results ?? [];
  },
};

// ---------------------------------------------------------------------------
// Optional AI endpoints: Hermes newsroom on backend master (newsroom/urls.py,
// mounted at /api/newsroom/). Every call degrades to null / "unavailable" on
// 404 or 503 so the site works with or without Hermes deployed.
//
//   GET  /api/newsroom/articles/<slug>/summary/             -> { id, slug, title, tldr, why_it_matters }
//   GET  /api/newsroom/articles/<slug>/translations/<lang>/ -> { article_slug, language, title, excerpt, content, tldr, why_it_matters, is_approved, updated_at }
//   POST /api/newsroom/articles/<slug>/ask/  { question }   -> { question, answer, answerable, quotes[], grounded_on, ai_generated }
//   GET  /api/newsroom/articles/<slug>/related/?limit=n     -> [{ id, title, slug, excerpt, tldr, category (slug), published_at, featured_image_url }]
//
// tldr / why_it_matters are also on the article detail payload itself. There is no
// public digest endpoint (POST /api/newsroom/digest/ is staff-only and drafts a
// newsletter), so the home briefing is built from live articles.
// ---------------------------------------------------------------------------

const NEWSROOM = '/api/newsroom/articles';
const slugPath = (slug: string) => `${NEWSROOM}/${encodeURIComponent(slug)}`;

const titleCase = (slug: string) => slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

export const aiApi = {
  /** TL;DR and why it matters for one live article. */
  async brief(slug: string, signal?: AbortSignal): Promise<Partial<Article> | null> {
    const data = await optional(request<Record<string, unknown>>(`${slugPath(slug)}/summary/`, { signal, retries: 0, anonymous: true }));
    if (!data) return null;
    const a = normalizeArticle({ slug, tldr: data.tldr, why_it_matters: data.why_it_matters });
    if (!a.tldr && !a.whyItMatters) return null;
    return { tldr: a.tldr, whyItMatters: a.whyItMatters };
  },

  /** Approved translation (Bangla by default). 404 when none is approved yet. */
  async translate(slug: string, lang = 'bn', signal?: AbortSignal): Promise<{ title?: string; tldr?: string[] } | null> {
    const data = await optional(
      request<Record<string, unknown>>(`${slugPath(slug)}/translations/${encodeURIComponent(lang)}/`, { signal, retries: 0, anonymous: true }),
    );
    if (!data || data.is_approved === false) return null;
    const a = normalizeArticle({ slug, translations: { bn: { title: data.title, tldr: data.tldr } } });
    return a.titleBn || a.tldrBn ? { title: a.titleBn, tldr: a.tldrBn } : null;
  },

  /** Is the Q&A endpoint deployed? A GET on the POST-only view answers 405; a missing route 404; disabled 503. */
  async askAvailable(slug: string, signal?: AbortSignal): Promise<boolean> {
    try {
      await request(`${slugPath(slug)}/ask/`, { signal, retries: 0, anonymous: true, timeoutMs: 8000 });
      return true;
    } catch (err) {
      return err instanceof ApiError && [401, 403, 405].includes(err.status);
    }
  },

  /** Answers are grounded only on the article text; quotes are exact sentences from it. */
  async ask(slug: string, question: string, signal?: AbortSignal): Promise<AskResponse> {
    const data = await request<{ answer?: unknown; answerable?: unknown; quotes?: unknown }>(`${slugPath(slug)}/ask/`, {
      method: 'POST',
      body: { question },
      signal,
      anonymous: true,
      timeoutMs: 45000,
    });
    const quotes = Array.isArray(data?.quotes) ? data.quotes.filter((q): q is string => typeof q === 'string' && q.trim() !== '') : [];
    return {
      answer: typeof data?.answer === 'string' ? data.answer : '',
      answerable: typeof data?.answerable === 'boolean' ? data.answerable : undefined,
      quotes,
    };
  },

  async related(slug: string, signal?: AbortSignal, limit = 4): Promise<Article[] | null> {
    const data = await optional(request<unknown>(`${slugPath(slug)}/related/`, { params: { limit }, signal, retries: 0, anonymous: true }));
    if (!Array.isArray(data)) return null;
    const rows = data.map((row) => {
      if (row && typeof row === 'object' && typeof (row as Record<string, unknown>).category === 'string') {
        const cat = (row as Record<string, string>).category;
        return { ...(row as object), category: { id: 0, slug: cat, name: titleCase(cat) } };
      }
      return row;
    });
    const list = normalizeList(rows).results.filter((a) => a.slug);
    return list.length ? list : null;
  },
};

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

export const newsletterApi = {
  subscribe(email: string, firstName?: string) {
    return request<{ message?: string; already_subscribed?: boolean }>('/api/newsletter/subscribe/', {
      method: 'POST',
      body: { email, first_name: firstName || '' },
      anonymous: true,
    });
  },
  /** Backend: POST /api/newsletter/unsubscribe/ with { token } or { email } (no id in the path). */
  unsubscribe(input: { token?: string; email?: string }) {
    return request<{ message?: string; email?: string }>('/api/newsletter/unsubscribe/', {
      method: 'POST',
      body: input,
      anonymous: true,
    });
  },
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const authApi = {
  login(email: string, password: string) {
    return request<LoginResponse>('/api/auth/login/', { method: 'POST', body: { email, password }, anonymous: true });
  },
  register(payload: RegisterPayload) {
    return request<{ user: AuthUser; message?: string }>('/api/auth/register/', { method: 'POST', body: payload, anonymous: true });
  },
  social(provider: string, accessToken: string) {
    return request<LoginResponse>('/api/auth/social-auth/', {
      method: 'POST',
      body: { provider, access_token: accessToken },
      anonymous: true,
    });
  },
  /** The backend's X OAuth flow requires the user's email up front. */
  xLoginUrl(email: string) {
    return buildUrl('/api/auth/social-auth/x/login/', { email });
  },
  requestPasswordReset(email: string) {
    return request<{ message?: string }>('/api/auth/password-reset/', { method: 'POST', body: { email }, anonymous: true });
  },
  /** Target of the reset email link: /reset-password/:uid/:token */
  confirmPasswordReset(uid: string, token: string, password: string) {
    return request<{ message?: string }>('/api/auth/password-reset/confirm/', {
      method: 'POST',
      body: { uid, token, password },
      anonymous: true,
    });
  },
};

// ---------------------------------------------------------------------------
// Subscriptions & donations (Stripe Checkout URLs come from the backend)
// ---------------------------------------------------------------------------

export const subscriptionApi = {
  async plans(): Promise<SubscriptionPlan[]> {
    const data = await request<SubscriptionPlan[] | { results?: SubscriptionPlan[] }>('/api/subscription/plans/', { anonymous: true });
    return Array.isArray(data) ? data : data?.results ?? [];
  },
  async current(): Promise<UserSubscription | null> {
    try {
      return await request<UserSubscription>('/api/subscription/subscriptions/current/', { retries: 0 });
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) return null;
      throw err;
    }
  },
  /** DRF @action without url_path keeps the underscore: create_checkout. */
  /**
   * `marketingOptIn` is the reader's own answer to the unchecked opt-in box on /subscribe. It is
   * always sent explicitly, because the backend defaults a missing value to true.
   */
  createCheckout(planId: string | number, marketingOptIn: boolean) {
    return request<CheckoutResponse>('/api/subscription/subscriptions/create_checkout/', {
      method: 'POST',
      body: { plan_id: planId, consent_opt_in: marketingOptIn === true, consent_source: 'checkout' },
    });
  },
  cancel(id: string | number) {
    return request<{ message?: string }>(`/api/subscription/subscriptions/${id}/cancel/`, { method: 'POST' });
  },
  reactivate(id: string | number) {
    return request<{ message?: string }>(`/api/subscription/subscriptions/${id}/reactivate/`, { method: 'POST' });
  },
};

export const donationApi = {
  createCheckout(input: { amount: number; recurring: boolean; email?: string; name?: string }) {
    return request<CheckoutResponse>('/api/donation/create/', {
      method: 'POST',
      body: {
        amount: input.amount,
        plan: input.recurring ? 'monthly' : 'custom',
        billing_cycle: input.recurring ? 'monthly' : 'one_time',
        email: input.email,
        name: input.name,
      },
    });
  },
};

/** The backend has no contact endpoint; the contact page composes an email instead of POSTing to /api/contact/. */
export const CONTACT_ENDPOINT_AVAILABLE = false;
