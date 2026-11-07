/**
 * Shared API types for The Age of GenZ.
 *
 * Every AI-era field (tldr, why_it_matters, sources, perspectives, translations,
 * related) is optional: the production API does not send them yet, and the UI must
 * render cleanly without them.
 */

export type ContentBlockType = 'paragraph' | 'heading' | 'image' | 'quote';

export interface BlockLink {
  text?: string;
  url?: string;
  href?: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  id?: string;
  text: string;
  links?: BlockLink[];
}

export interface HeadingBlock {
  type: 'heading';
  id?: string;
  text: string;
  level?: 'h2' | 'h3';
}

export interface ImageBlock {
  type: 'image';
  id?: string;
  url: string;
  caption?: string;
  position?: 'center' | 'wide' | 'full';
  alt?: string;
  public_id?: string;
}

export interface QuoteBlock {
  type: 'quote';
  id?: string;
  text: string;
  author?: string;
}

export type ContentBlock = ParagraphBlock | HeadingBlock | ImageBlock | QuoteBlock;

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  parent_slug?: string | null;
  published_count?: number;
  children?: Category[];
}

export interface Author {
  id?: number;
  name: string;
  slug?: string;
  bio?: string;
  avatar?: string;
  /** Author profile page, when the backend provides one. */
  url?: string;
  /** Job title, e.g. "Staff writer" (backend content-trust author payload). */
  role?: string;
  /** True for the newsroom desk byline rather than a named person. */
  isDesk?: boolean;
}

/** Backend source kinds (content trust contract): the outlet a rewritten story came from, research, or a reference. */
export type SourceKind = 'original' | 'research' | 'reference';

export interface ArticleSource {
  title: string;
  url: string;
  publisher?: string;
  /** Source kind from the backend, when it sends a known one. */
  kind?: SourceKind;
}

/** An approved translation of an article (backend /api/newsroom/articles/<slug>/translations/<lang>/). */
export interface ArticleTranslation {
  language: string;
  title?: string;
  excerpt?: string;
  /** HTML body, sanitised by ArticleBody like the original. */
  content?: string;
  tldr?: string[];
  whyItMatters?: string;
}

/** GET /api/authors/<slug>/?page= : the author plus one page of their live articles (12 per page). */
export interface AuthorProfile {
  author: Author & { articleCount: number };
  articles: Article[];
  count: number;
  page: number;
  pages: number;
  next: string | null;
  previous: string | null;
}

export interface Perspective {
  label: string;
  summary: string;
  url?: string;
}

/** Normalised article shape used everywhere in the UI. */
export interface Article {
  id: number;
  title: string;
  slug: string;
  href: string;
  canonicalUrl: string;
  shortLink: string | null;
  excerpt: string;
  content: string;
  contentBlocks: ContentBlock[] | null;
  image: string | null;
  imageCaption: string | null;
  imageCredit?: string | null;
  category: Category;
  author: Author;
  isFeatured: boolean;
  isOpinion: boolean;
  publishedAt: string;
  updatedAt: string;
  /** When the text itself last changed (backend content_updated_at), when the API sends it. */
  contentUpdatedAt?: string;
  /** The backend's own verdict on whether the story was meaningfully updated after publication. */
  isUpdated?: boolean;
  /** Server flag on home cards: published today in the newsroom time zone. */
  publishedToday?: boolean;
  /** Alt text for the featured image, when the newsroom wrote one. */
  imageAlt?: string;
  readMinutes: number;
  /** Total views, when the API includes view_count. */
  views?: number;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  // Optional AI fields (Hermes newsroom, backend master). Empty or absent when Hermes has not run.
  tldr?: string[];
  /** True only when the backend says an editor reviewed the AI summary. */
  aiReviewed?: boolean;
  whyItMatters?: string;
  sources?: ArticleSource[];
  perspectives?: Perspective[];
  titleBn?: string;
  tldrBn?: string[];
  relatedSlugs?: string[];
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  is_subscriber?: boolean;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface SubscriptionPlan {
  id: number | string;
  name: string;
  description?: string;
  price?: string | number;
  amount?: string | number;
  interval?: string;
  billing_cycle?: string;
  is_popular?: boolean;
  has_ad_free_experience?: boolean;
  has_newsletter_access?: boolean;
  has_premium_content?: boolean;
  has_early_access?: boolean;
}

export interface UserSubscription {
  id: number | string;
  status: string;
  plan?: SubscriptionPlan | number | string;
  plan_name?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface CheckoutResponse {
  session_id?: string;
  checkout_url?: string;
  id?: string;
  url?: string;
}

export interface AskResponse {
  answer: string;
  /** false when the article does not answer the question. */
  answerable?: boolean;
  /** Exact sentences from the article the answer rests on. */
  quotes: string[];
}
