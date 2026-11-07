/**
 * Studio API: thin typed wrappers over the shared client (JWT from the site login, auto refresh).
 * Every path is a staff endpoint on the Django backend; the backend enforces is_staff.
 */
import { API_BASE_URL, ApiError, buildUrl, request, tokenStore } from '@/lib/api/client';
import type {
  Campaign,
  Category,
  Cluster,
  Donation,
  Engagement,
  HermesRun,
  Insights,
  Me,
  MediaAsset,
  NewsroomStats,
  Overview,
  Paginated,
  PublishHours,
  RangeParams,
  Returning,
  SiteSettings,
  StudioArticle,
  StudioUser,
  Subscriber,
  Timeseries,
  WorkflowResult,
} from './types';

type Q = Record<string, string | number | boolean | undefined | null>;

const get = <T>(path: string, params?: Q) => request<T>(path, { params });
const post = <T>(path: string, body?: unknown, params?: Q) => request<T>(path, { method: 'POST', body: body ?? {}, params });
const patch = <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body });
const del = <T>(path: string, params?: Q) => request<T>(path, { method: 'DELETE', params });

/** Multipart upload with the same auth as request() (fetch, no JSON content type). */
async function upload<T>(path: string, form: FormData): Promise<T> {
  const send = (token: string | null) =>
    fetch(buildUrl(path), { method: 'POST', body: form, headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const res = await send(tokenStore.access);
  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail = data && typeof data === 'object' && 'detail' in data ? String((data as { detail: unknown }).detail) : `Upload failed (${res.status})`;
    throw new ApiError(detail, res.status, data);
  }
  return data as T;
}

/** Download an authenticated file (CSV export) and hand it to the browser. */
async function download(path: string, params: Q, filename: string): Promise<void> {
  const res = await fetch(buildUrl(path, params), { headers: { Authorization: `Bearer ${tokenStore.access ?? ''}` } });
  if (!res.ok) throw new ApiError(`Export failed (${res.status})`, res.status, null);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const range = (r: RangeParams): Q => (r.start ? { start: r.start, end: r.end } : { days: r.days ?? 30 });

export const studioApi = {
  chatUrl: `${API_BASE_URL}/api/admin/chat/`,
  me: () => get<Me>('/api/admin/me/'),

  // stats
  overview: (r: RangeParams) => get<Overview>('/api/admin/stats/overview/', range(r)),
  insights: (r: RangeParams) => get<Insights>('/api/admin/stats/insights/', range(r)),
  timeseries: (r: RangeParams) => get<Timeseries>('/api/admin/stats/timeseries/', range(r)),
  newsroomStats: (r: RangeParams) => get<NewsroomStats>('/api/admin/stats/newsroom/', range(r)),
  publishHours: (r: RangeParams) => get<PublishHours>('/api/admin/stats/publish-hours/', range(r)),
  engagement: (r: RangeParams) => get<Engagement>('/api/admin/stats/engagement/', { ...range(r), limit: 8 }),
  returning: (r: RangeParams) => get<Returning>('/api/admin/stats/returning/', range(r)),

  // articles
  articles: (q: Q) => get<Paginated<StudioArticle>>('/api/admin/articles/', q),
  article: (id: number) => get<StudioArticle>(`/api/admin/articles/${id}/`),
  createArticle: (body: Partial<StudioArticle>) => post<StudioArticle>('/api/admin/articles/', body),
  updateArticle: (id: number, body: Partial<StudioArticle>) => patch<StudioArticle>(`/api/admin/articles/${id}/`, body),
  approve: (id: number) => post<StudioArticle>(`/api/admin/articles/${id}/approve/`),
  schedule: (id: number, scheduled_for: string | null) => post<StudioArticle>(`/api/admin/articles/${id}/schedule/`, { scheduled_for }),
  publish: (id: number) => post<WorkflowResult>(`/api/admin/articles/${id}/publish/`, { confirm: true }),
  unpublish: (id: number) => post<StudioArticle>(`/api/admin/articles/${id}/unpublish/`, { confirm: true }),
  archive: (id: number) => post<StudioArticle>(`/api/admin/articles/${id}/archive/`),
  restore: (id: number) => post<StudioArticle>(`/api/admin/articles/${id}/restore/`),
  deleteArticle: (id: number) => del<void>(`/api/admin/articles/${id}/`, { confirm: true }),
  setFeaturedFromMedia: (id: number, media_id: number) => post<StudioArticle>(`/api/admin/articles/${id}/featured-image/`, { media_id }),
  uploadFeatured: (id: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return upload<StudioArticle>(`/api/admin/articles/${id}/featured-image/`, form);
  },
  removeFeatured: (id: number) => del<StudioArticle>(`/api/admin/articles/${id}/featured-image/`),

  // categories + media
  categories: () => get<Category[]>('/api/admin/categories/'),
  createCategory: (body: Partial<Category>) => post<Category>('/api/admin/categories/', body),
  updateCategory: (id: number, body: Partial<Category>) => patch<Category>(`/api/admin/categories/${id}/`, body),
  deleteCategory: (id: number) => del<void>(`/api/admin/categories/${id}/`),
  media: (q: Q) => get<Paginated<MediaAsset>>('/api/admin/media/', q),
  uploadMedia: (file: File, meta: { alt_text?: string; caption?: string; credit?: string }) => {
    const form = new FormData();
    form.append('file', file);
    Object.entries(meta).forEach(([k, v]) => v && form.append(k, v));
    return upload<MediaAsset>('/api/admin/media/', form);
  },
  updateMedia: (id: number, body: Partial<MediaAsset>) => patch<MediaAsset>(`/api/admin/media/${id}/`, body),
  deleteMedia: (id: number) => del<void>(`/api/admin/media/${id}/`),

  // newsroom
  newsroomStatus: () => get<{ hermes: { configured: boolean; status: string }; auto_publish: boolean; research_enabled: boolean }>('/api/newsroom/status/'),
  clusters: (page = 1) => get<Paginated<Cluster>>('/api/newsroom/clusters/', { page }),
  runResearch: () => post<Record<string, unknown>>('/api/newsroom/research/run/', { ingest: false }),
  draftFromCluster: (id: number) => post<{ id?: number; article_id?: number } & Record<string, unknown>>(`/api/newsroom/clusters/${id}/draft/`),
  runStep: (articleId: number, step: string) => post<Record<string, unknown>>(`/api/newsroom/drafts/${articleId}/run/${step}/`),
  hermesRuns: (q: Q) => get<Paginated<HermesRun>>('/api/admin/newsroom/hermes-runs/', q),

  // newsletter
  campaigns: (q: Q = {}) => get<Paginated<Campaign>>('/api/admin/newsletter/campaigns/', q),
  campaign: (id: number) => get<Campaign>(`/api/admin/newsletter/campaigns/${id}/`),
  updateCampaign: (id: number, body: Partial<Campaign>) => patch<Campaign>(`/api/admin/newsletter/campaigns/${id}/`, body),
  deleteCampaign: (id: number) => del<void>(`/api/admin/newsletter/campaigns/${id}/`),
  recipients: (id: number) => get<{ campaign: number; recipients: number }>(`/api/admin/newsletter/campaigns/${id}/recipients/`),
  sendCampaign: (id: number) => post<Record<string, unknown>>(`/api/admin/newsletter/campaigns/${id}/send/`, { confirm: true }),
  draftDigest: (kind: 'daily' | 'breaking') => post<{ campaign_id: number; subject: string; status: string } | null>('/api/newsroom/digest/', { kind }),
  subscribers: (q: Q) => get<Paginated<Subscriber>>('/api/admin/newsletter/subscribers/', q),
  updateSubscriber: (id: number, body: Partial<Subscriber>) => patch<Subscriber>(`/api/admin/newsletter/subscribers/${id}/`, body),

  // money, people, settings
  donations: (q: Q) => get<Paginated<Donation>>('/api/admin/donations/', q),
  exportDonations: (q: Q) => download('/api/admin/donations/export/', q, 'donations.csv'),
  users: (q: Q) => get<Paginated<StudioUser>>('/api/admin/users/', q),
  disableUser: (id: number) => post<StudioUser>(`/api/admin/users/${id}/disable/`),
  enableUser: (id: number) => post<StudioUser>(`/api/admin/users/${id}/enable/`),
  settings: () => get<SiteSettings>('/api/admin/site-settings/'),
  updateSettings: (body: Partial<SiteSettings>) => patch<SiteSettings>('/api/admin/site-settings/', body),
};

export const errorText = (err: unknown, fallback = 'Something went wrong.') =>
  err instanceof ApiError ? err.message : err instanceof Error ? err.message : fallback;
