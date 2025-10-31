// User types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
}

// Author type (simplified since no real authors in backend)
export interface Author {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  avatar?: string;
}

// Category type (mock since no categories in backend)
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  is_active?: boolean;
  parent_slug?: string | null;
  children?: Category[];
}
export interface CategoryListMeta {
  count: number;
  next: string | null;
  previous: string | null;
}

// Tag type (not in backend but kept for compatibility)
export interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Article type - updated to match your actual backend
export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  featured_image_url?: string | null; 
  author: Author;
  category: Category;
  category_name: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED';
  is_featured: boolean;
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  estimated_read_time: number;
  caption?: string | null;
  featured_image_caption?: string | null;
  
  // Backward compatibility fields
  image: string | null;
  description: string;
  date: string;
  views: number;
  featured: boolean;
  formattedDate?: string; // Optional formatted date
}

// Backend Article type (what actually comes from your Django API)
export interface BackendArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  featured_image_url?: string | null;  // 🔧 ADD THIS LINE
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  meta_title: string;
  meta_description: string;
  caption?: string | null;
  featured_image_caption?: string | null;
}

// Comment type (future use)
export interface Comment {
  id: number;
  article: number;
  author: User;
  content: string;
  parent?: number;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
}

// Newsletter subscription
export interface NewsletterSubscription {
  id: number;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

// Contact form
export interface ContactForm {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

// API Response types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  errors?: { [key: string]: string[] };
}

// Authentication types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  category?: string;
  author?: string;
  tags?: string[];
  is_featured?: boolean;
  date_from?: string;
  date_to?: string;
}

// Donation/Subscription types
export interface DonationPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
}

export interface Subscription {
  id: string;
  plan: DonationPlan;
  status: 'active' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

// Social sharing
export interface SocialShareUrls {
  facebook: string;
  twitter: string;
  linkedin: string;
  email: string;
  copy: string;
}

// App state types
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export default {};
