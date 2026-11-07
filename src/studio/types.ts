/** Shapes returned by the Studio staff API (/api/admin/*). Read from the backend serializers and core/stats.py. */

export interface Period {
  start: string;
  end: string;
  days: number;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Me {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  name: string;
  role?: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface Kpi {
  label: string;
  value: number;
  previous: number;
  change: number;
  change_pct: number | null;
  unit: 'count' | 'usd' | string;
}

export interface Overview {
  period: Period;
  previous_period: Period;
  kpis: Record<string, Kpi>;
  definitions?: Record<string, string>;
}

export interface Insight {
  kind: string;
  text: string;
  direction: 'up' | 'down' | 'warn' | 'info';
  score: number;
  article_id?: number;
}

export interface Insights {
  period: Period;
  insights: Insight[];
}

export interface Timeseries {
  period: Period;
  labels: string[];
  series: {
    page_views: number[];
    readers: number[];
    articles_published: number[];
    new_subscribers: number[];
    unsubscribes: number[];
    donations_usd: number[];
    ai_cost_usd: number[];
  };
}

export interface NotEnough {
  status: 'not_enough_data';
  sample: Record<string, number>;
  needed: string;
}

export interface PublishHours {
  period: Period;
  timezone: string;
  reading: {
    status: 'ok' | 'not_enough_data';
    hours: { hour: number; views: number; avg_per_day: number; share_pct: number }[];
    sample: { views: number; days: number };
    peak_hour?: number;
    peak_share_pct?: number;
    needed?: string;
  };
  publishing: {
    status: 'ok' | 'not_enough_data';
    hours: { hour: number; articles: number; median_views_first_2_days: number; comparable: boolean }[];
    sample: { articles: number; comparable_hours: number };
    best_hour?: number;
    best_median_views?: number;
    needed?: string;
  };
}

export interface Engagement {
  period: Period;
  status: 'ok' | 'not_enough_data';
  needed?: string;
  sample?: Record<string, number>;
  summary: {
    sessions: number;
    avg_read_seconds: number;
    avg_scroll_pct: number;
    reached_pct: Record<'25' | '50' | '75' | '90', number>;
  };
  series: { labels: string[]; sessions: number[]; avg_read_seconds: (number | null)[] };
  articles: { id: number; title: string; sessions: number; avg_read_seconds: number; avg_scroll_pct: number; finished_pct: number }[];
  min_article_sessions: number;
}

export interface Returning {
  period: Period;
  status: 'ok' | 'not_enough_data';
  needed?: string;
  readers: number;
  returning: number;
  returning_rate_pct: number | null;
  previous: { readers: number; returning: number; returning_rate_pct: number | null };
  definition: string;
}

export type ArticleStatus = 'draft' | 'ready' | 'scheduled' | 'published' | 'archived';
export type FlagState = 'ok' | 'warn' | 'fail' | 'pending';
export interface CheckFlag {
  state: FlagState;
  note: string;
}

export interface StudioArticle {
  id: number;
  title: string;
  slug: string;
  status: ArticleStatus;
  content: string;
  excerpt: string;
  tldr: string;
  why_it_matters: string;
  meta_title: string;
  meta_description: string;
  category: number | null;
  category_name: string | null;
  is_featured: boolean;
  source_url: string;
  featured_image: string | null;
  featured_image_url: string | null;
  is_published: boolean;
  published_at: string | null;
  scheduled_for: string | null;
  newsroom_status: string;
  human_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  is_archived: boolean;
  check_status: 'pending' | 'passed' | 'needs_human' | 'blocked' | null;
  check_flags: Record<'fact' | 'risk' | 'seo' | 'duplicate', CheckFlag>;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkflowResult {
  published: boolean;
  reason: string;
  article: StudioArticle;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  parent: number | null;
  is_active: boolean;
  created_at: string;
  article_count: number;
}

export interface MediaAsset {
  id: number;
  public_id: string;
  url: string;
  original_filename: string;
  alt_text: string;
  caption: string;
  credit: string;
  width: number;
  height: number;
  bytes: number;
  format: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface Cluster {
  id: number;
  key: string;
  title: string;
  keywords: string[];
  size: number;
  source_count: number;
  trend_score: number;
  is_breaking: boolean;
  summary: string;
  why_trending: string;
  suggested_angle: string;
  status: string;
  draft_article: number | null;
  sources?: { url: string; title?: string }[];
}

export interface HermesRun {
  id: number;
  created_at: string;
  skill: string;
  ok: boolean;
  error: string;
  provider: string;
  model: string;
  stub: boolean;
  latency_ms: number | null;
  prompt_tokens: number;
  completion_tokens: number;
  cost_usd: string;
  cost_is_estimate: boolean;
  article: number | null;
  article_title: string | null;
}

export interface Campaign {
  id: number;
  name: string;
  subject: string;
  content: string;
  html_content: string;
  campaign_type: string;
  status: string;
  featured_articles: number[];
  target_all_subscribers: boolean;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
  total_recipients: number;
  emails_sent: number;
  emails_delivered: number;
  emails_opened: number;
  emails_clicked: number;
  emails_bounced: number;
  emails_unsubscribed: number;
}

export interface Subscriber {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_confirmed: boolean;
  frequency: string;
  subscription_date: string;
  unsubscribe_date: string | null;
  engagement_score: number;
}

export interface Donation {
  id: string;
  tracking_id: string;
  donor_name: string;
  donor_email: string;
  amount: string;
  plan: string;
  billing_cycle: string;
  status: string;
  payment_method: string;
  is_anonymous: boolean;
  message: string;
  campaign: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface StudioUser {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  is_subscriber: boolean;
  email_verified: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface SiteSettings {
  id: number;
  site_name: string;
  site_description: string;
  maintenance_mode: boolean;
}

export interface NewsroomStats {
  queue: Record<string, number>;
  checks: Record<string, number>;
  hermes: { runs: number; live_runs: number; failed: number; cost_usd: number; by_skill?: { skill: string; runs: number; cost_usd: number }[] } & Record<string, unknown>;
  publish_cadence: { longest_gap_hours: number | null } & Record<string, unknown>;
}

export type RangeParams = { days?: number; start?: string; end?: string };
