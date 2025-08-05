import axios, { AxiosResponse, AxiosError } from 'axios';
import type { Article, Category } from '../types';

// ✅ FIXED: Use production backend URL as fallback
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ageofgenz-backend.onrender.com';

interface PaginatedArticlesResponse {
  results: Article[];
  next: string | null;
  previous: string | null;
  count: number;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    bio?: string;
    is_subscriber?: boolean;
  };
}

interface RegisterResponse {
  user: {
    id: number;
    email: string;
    username: string;
  };
  message: string;
}

interface SubscribeResponse {
  message: string;
  success: boolean;
}

interface ResetPasswordResponse {
  message: string;
}

interface SubscriptionResponse {
  id: string;
  status: string;
  amount: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ ENHANCED: Add debug logging for API URL
console.log('🚀 API Configuration:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  API_BASE_URL: API_BASE_URL,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD
});

api.interceptors.request.use(
  (config) => {
    console.log('🔄 API Request:', config.method?.toUpperCase(), config.url, config.params);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ IMPROVED: Updated response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url, 'Data:', response.data);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.config.url, error.response?.data || error.message);
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry && 
        !originalRequest.url.includes('api/auth/login') && 
        !originalRequest.url.includes('api/token/refresh/')) {
      originalRequest._retry = true;
      
      try {
        const refresh = localStorage.getItem('refresh');
        if (!refresh) {
          throw new Error('No refresh token available');
        }
        
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, { refresh });
        if (!response.data.access) {
          throw new Error('No access token in refresh response');
        }
        
        const newToken = response.data.access;
        localStorage.setItem('token', newToken);
        
        // Update auth header and retry original request
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Clear auth data and redirect to login on refresh failure
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async <T>(
  fn: () => Promise<AxiosResponse<T>>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<AxiosResponse<T>> => {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0 || !(error instanceof AxiosError)) throw error;
    console.warn(`⚠️  Request failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await wait(delay);
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

// Transform backend data to frontend format with better debugging
const transformArticle = (backendArticle: any): Article => {
  console.log('🔄 Raw backend article:', backendArticle);
  
  const transformed: Article = {
    id: backendArticle.id,
    title: backendArticle.title || 'Untitled',
    slug: backendArticle.slug || '',
    excerpt: backendArticle.excerpt || '',
    content: backendArticle.content || '',
    
    // ✅ CRITICAL FIX: Use featured_image_url from backend API
    featured_image: backendArticle.featured_image_url || backendArticle.featured_image || null,
    featured_image_url: backendArticle.featured_image_url || null,
    
    // Enhanced author handling
    author: backendArticle.author ? 
      (typeof backendArticle.author === 'object' ? backendArticle.author : { id: 1, name: backendArticle.author }) :
      { id: 1, name: 'The Age of GenZ' },
    
    // Enhanced category handling
    category: backendArticle.category ? 
      (typeof backendArticle.category === 'object' ? backendArticle.category : { id: 1, name: backendArticle.category, slug: backendArticle.category.toLowerCase() }) :
      { id: 1, name: 'General', slug: 'general' },
    
    category_name: backendArticle.category?.name || backendArticle.category || 'General',
    
    tags: backendArticle.tags || [],
    status: backendArticle.is_published ? 'PUBLISHED' as const : 'DRAFT' as const,
    is_featured: Boolean(backendArticle.is_featured),
    view_count: Number(backendArticle.view_count) || 0,
    published_at: backendArticle.published_at || backendArticle.created_at,
    created_at: backendArticle.created_at,
    updated_at: backendArticle.updated_at,
    estimated_read_time: Math.ceil((backendArticle.content || '').split(' ').length / 200) || 1,
    
    // ✅ FIXED: Backward compatibility fields use new image URL
    image: backendArticle.featured_image_url || backendArticle.featured_image,
    description: backendArticle.excerpt || '',
    date: backendArticle.published_at || backendArticle.created_at,
    views: Number(backendArticle.view_count) || 0,
    featured: Boolean(backendArticle.is_featured)
  };
  
  console.log('🔄 Transformed article:', {
    id: transformed.id,
    title: transformed.title,
    featured_image: transformed.featured_image,
    featured_image_url: transformed.featured_image_url,
    category: transformed.category,
    is_featured: transformed.is_featured
  });
  
  return transformed;
};

// Article API calls
export const getArticles = async (page: number = 1) => {
  console.log('📖 Fetching articles, page:', page);
  const response = await retryRequest<any>(() =>
    api.get(`/api/articles/?page=${page}&page_size=25`)
  );
  
  console.log('📖 Raw API response:', response.data);
  
  let results = [];
  if (response.data.results) {
    results = response.data.results;
  } else if (Array.isArray(response.data)) {
    results = response.data;
  }
  
  const transformedResults = results.map(transformArticle);
  console.log('📖 All articles with categories:', transformedResults.map((a: Article) => ({ 
    id: a.id, 
    title: a.title, 
    category: a.category 
  })));
  
  return {
    ...response,
    data: {
      results: transformedResults,
      next: response.data.next || null,
      previous: response.data.previous || null,
      count: response.data.count || transformedResults.length
    }
  } as AxiosResponse<PaginatedArticlesResponse>;
};

export const getFeaturedArticles = async () => {
  console.log('⭐ Getting featured articles...');
  
  try {
    const response = await retryRequest<any>(() =>
      api.get(`/api/articles/`)
    );
    
    let results = [];
    if (response.data.results) {
      results = response.data.results;
    } else if (Array.isArray(response.data)) {
      results = response.data;
    }
    
    console.log('⭐ Raw articles for featured check:', results);
    
    const transformedResults = results.map(transformArticle);
    
    // Check each article's featured status
    const featuredArticles = transformedResults.filter((article: Article) => {
      const isFeatured = article.is_featured === true || article.featured === true;
      console.log(`⭐ Article "${article.title}": is_featured=${article.is_featured}, featured=${article.featured}, result=${isFeatured}`);
      return isFeatured;
    });
    
    console.log('⭐ Featured articles found:', featuredArticles.length);
    
    // If no featured articles, return first 4 as featured
    const finalArticles = featuredArticles.length > 0 ? featuredArticles : transformedResults.slice(0, 4);
    
    return {
      ...response,
      data: {
        results: finalArticles,
        next: null,
        previous: null,
        count: finalArticles.length
      }
    } as AxiosResponse<PaginatedArticlesResponse>;
  } catch (error) {
    console.error('⭐ Failed to get featured articles:', error);
    throw error;
  }
};

export const getTrendingArticles = async () => {
  console.log('🔥 Getting trending articles (using latest)...');
  
  try {
    const response = await getArticles();
    // Take first 6 articles as "trending"
    const trendingArticles = response.data.results.slice(0, 6);
    
    return {
      ...response,
      data: {
        results: trendingArticles,
        next: null,
        previous: null,
        count: trendingArticles.length
      }
    } as AxiosResponse<PaginatedArticlesResponse>;
  } catch (error) {
    console.error('🔥 Failed to get trending articles:', error);
    throw error;
  }
};

export const getArticlesBySearch = async (query: string) => {
  console.log('🔍 Searching articles for:', query);
  const response = await retryRequest<any>(() =>
    api.get(`/api/articles/?search=${encodeURIComponent(query)}`)
  );
  
  let results = [];
  if (response.data.results) {
    results = response.data.results;
  } else if (Array.isArray(response.data)) {
    results = response.data;
  }
  
  const transformedResults = results.map(transformArticle);
  
  return {
    ...response,
    data: {
      results: transformedResults,
      next: response.data.next || null,
      previous: response.data.previous || null,
      count: response.data.count || transformedResults.length
    }
  } as AxiosResponse<PaginatedArticlesResponse>;
};

// FIXED: Article by ID with proper fallback
export const getArticleById = async (id: number) => {
  console.log('📄 Fetching article by ID:', id);
  
  try {
    // Try direct endpoint first
    const response = await retryRequest<any>(() =>
      api.get(`/api/articles/${id}/`)
    );
    
    const transformedArticle = transformArticle(response.data);
    return {
      ...response,
      data: transformedArticle
    } as AxiosResponse<Article>;
  } catch (error) {
    console.warn('📄 Direct article endpoint failed, searching in all articles...');
    
    // Fallback: Get all articles and find the one with matching ID
    try {
      const allArticlesResponse = await getArticles();
      const allArticles = allArticlesResponse.data.results;
      
      const foundArticle = allArticles.find(article => article.id === id);
      
      if (!foundArticle) {
        throw new Error(`Article with ID ${id} not found in articles list`);
      }
      
      console.log('📄 Article found in list:', foundArticle.title);
      
      return {
        ...allArticlesResponse,
        data: foundArticle
      } as AxiosResponse<Article>;
    } catch (fallbackError) {
      console.error('📄 Failed to find article in list too:', fallbackError);
      throw new Error(`Article with ID ${id} not found`);
    }
  }
};

export const getArticleBySlug = async (slug: string) => {
  console.log('📄 Fetching article by slug:', slug);
  
  try {
    // Use direct endpoint - this works with your ViewSet
    const response = await retryRequest<any>(() =>
      api.get(`/api/articles/${slug}/`)
    );
    
    console.log('📄 Raw backend response:', response.data);
    const transformedArticle = transformArticle(response.data);
    console.log('📄 Transformed article:', transformedArticle);
    
    return {
      ...response,
      data: transformedArticle
    } as AxiosResponse<Article>;
  } catch (error: any) {
    console.error('📄 Failed to get article by slug:', error);
    console.error('📄 Error details:', error.response?.data);
    throw new Error(`Article with slug "${slug}" not found: ${error.response?.data?.detail || error.message}`);
  }
};

export const getCategories = async () => {
  console.log('📂 Fetching categories from backend');
  
  try {
    const response = await retryRequest<Category[]>(() =>
      api.get('/api/categories/')
    );
    
    console.log('📂 Categories fetched:', response.data);
    return {
      ...response,
      data: response.data
    } as AxiosResponse<Category[]>;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    throw error;
  }
};

// FIXED: Simplified category filtering using Django backend first
export const getArticlesByCategory = async (categorySlug: string, page: number = 1) => {
  console.log('📂 Fetching articles for category:', categorySlug);
  
  try {
    // First, try the Django filter directly using the backend filterset_fields
    const response = await retryRequest<any>(() =>
      api.get(`/api/articles/?category__slug=${categorySlug}&page=${page}`)
    );
    
    console.log('📂 Direct category filter response:', response.data);
    
    let results = [];
    if (response.data.results) {
      results = response.data.results;
    } else if (Array.isArray(response.data)) {
      results = response.data;
    }
    
    const transformedResults = results.map(transformArticle);
    
    console.log(`📂 Category "${categorySlug}" articles found:`, transformedResults.length);
    
    // If we got results from the backend filter, return them
    if (transformedResults.length > 0) {
      return {
        ...response,
        data: {
          results: transformedResults,
          next: response.data.next || null,
          previous: response.data.previous || null,
          count: response.data.count || transformedResults.length
        }
      } as AxiosResponse<PaginatedArticlesResponse>;
    }
    
    // Fallback: Get all articles and filter on frontend
    console.log('📂 No results from backend filter, trying frontend filtering...');
    throw new Error('No backend results, trying fallback');
    
  } catch (error) {
    console.log('📂 Backend filtering failed, using frontend fallback...');
    
    // Fallback: Get all articles and filter on frontend
    try {
      const allResponse = await getArticles();
      const allArticles = allResponse.data.results;
      
      console.log('📂 All articles for frontend filtering:', allArticles.length);
      
      // Simple category matching
      const filteredArticles = allArticles.filter(article => {
        const articleCategorySlug = article.category?.slug?.toLowerCase();
        const articleCategoryName = article.category?.name?.toLowerCase();
        const searchSlug = categorySlug.toLowerCase();
        
        // Category mapping for common variations
        const categoryMappings: { [key: string]: string[] } = {
          'world': ['world', 'world news', 'global', 'international'],
          'sports': ['sports', 'sport', 'athletics', 'games'],
          'opinion': ['opinion', 'editorial', 'commentary', 'perspective'],
          'politics': ['politics', 'political', 'government', 'policy'],
          'culture': ['culture', 'arts', 'lifestyle', 'social'],
          'ai': ['ai', 'artificial intelligence', 'tech', 'technology'],
          'memes': ['memes', 'humor', 'funny', 'entertainment'],
          'insights': ['insights', 'analysis', 'deep dive', 'research']
        };
        
        const possibleMatches = categoryMappings[searchSlug] || [searchSlug];
        
        const isMatch = possibleMatches.some(match => 
          articleCategorySlug?.includes(match) ||
          articleCategoryName?.includes(match) ||
          articleCategorySlug === match ||
          articleCategoryName === match
        );
        
        console.log(`📂 Article "${article.title}" category check:`, {
          articleSlug: articleCategorySlug,
          articleName: articleCategoryName,
          searchSlug,
          isMatch
        });
        
        return isMatch;
      });
      
      console.log(`📂 Frontend filter found ${filteredArticles.length} articles for category "${categorySlug}"`);
      
      return {
        ...allResponse,
        data: {
          results: filteredArticles,
          next: null,
          previous: null,
          count: filteredArticles.length
        }
      } as AxiosResponse<PaginatedArticlesResponse>;
      
    } catch (fallbackError) {
      console.error('📂 Frontend filtering also failed:', fallbackError);
      throw error;
    }
  }
};

// NEW: Specific function for opinion articles
export const getOpinionArticles = async (page: number = 1) => {
  console.log('💭 Fetching opinion articles...');
  
  try {
    // Try to get articles with opinion category first
    try {
      const response = await getArticlesByCategory('opinion', page);
      if (response.data.results.length > 0) {
        console.log('💭 Found articles in opinion category:', response.data.results.length);
        return response;
      }
    } catch (error) {
      console.log('💭 No dedicated opinion category, filtering all articles...');
    }
    
    // Fallback: Get all articles and filter for opinion-related content
    const allResponse = await getArticles(page);
    const allArticles = allResponse.data.results;
    
    // Keywords that indicate opinion content
    const opinionKeywords = [
      'opinion', 'think', 'believe', 'perspective', 'view', 'commentary',
      'analysis', 'editorial', 'debate', 'argue', 'discuss', 'critic',
      'review', 'reflect', 'consider', 'examine', 'evaluate', 'assessment',
      'stance', 'position', 'viewpoint', 'thoughts', 'personal', 'subjective'
    ];
    
    const opinionArticles = allArticles.filter(article => {
      const content = (
        article.title + ' ' + 
        (article.excerpt || '') + ' ' + 
        (article.content || '') + ' ' +
        (article.category?.name || '')
      ).toLowerCase();
      
      const hasOpinionKeywords = opinionKeywords.some(keyword => content.includes(keyword));
      
      console.log(`💭 Article "${article.title}" opinion check:`, {
        hasOpinionKeywords,
        category: article.category?.name
      });
      
      return hasOpinionKeywords;
    });
    
    console.log(`💭 Found ${opinionArticles.length} opinion-related articles`);
    
    // If no opinion-related articles found, return first 6 articles as "opinions"
    const finalArticles = opinionArticles.length > 0 ? opinionArticles : allArticles.slice(0, 6);
    
    return {
      ...allResponse,
      data: {
        results: finalArticles,
        next: null,
        previous: null,
        count: finalArticles.length
      }
    } as AxiosResponse<PaginatedArticlesResponse>;
    
  } catch (error) {
    console.error('💭 Failed to get opinion articles:', error);
    throw error;
  }
};

// Newsletter
export const subscribeToNewsletter = async (email: string) => {
  console.log('📧 Subscribing to newsletter:', email);
  return retryRequest<SubscribeResponse>(() => 
    api.post('/api/newsletter/subscribe/', { email })
  );
};

export const unsubscribeFromNewsletter = async (id: number): Promise<AxiosResponse> => {
  return api.post(`/api/newsletter/unsubscribe/${id}/`);
};

// ✅ IMPROVED: Login with better error handling
export const loginUser = async (email: string, password: string) => {
  console.log('🔐 Attempting login for:', email);
  try {
    const response = await retryRequest<LoginResponse>(() => 
      api.post('/api/auth/login/', { email, password })
    );
    
    // Validate response data
    if (!response.data.access || !response.data.refresh) {
      throw new Error('Invalid login response: missing tokens');
    }
    
    // Store tokens
    localStorage.setItem('token', response.data.access);
    localStorage.setItem('refresh', response.data.refresh);
    
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    // Clear any existing tokens on login failure
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    throw error;
  }
};

// ✅ FIXED: Registration function to match what AuthContext expects
export const registerUser = async (userData: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}) => {
  console.log('👤 Registering user with data:', userData);
  try {
    const response = await retryRequest<RegisterResponse>(() =>
      api.post('/api/auth/register/', userData)
    );
    
    // Validate registration response
    if (!response.data.user || !response.data.user.id) {
      throw new Error('Invalid registration response: missing user data');
    }
    
    return response;
  } catch (error: any) {
    console.error('Registration failed:', error);
    // Enhance error message for common issues
    if (error.response?.data) {
      const errorData = error.response.data;
      if (errorData.email) {
        throw new Error(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
      }
      if (errorData.username) {
        throw new Error(Array.isArray(errorData.username) ? errorData.username[0] : errorData.username);
      }
      if (errorData.password) {
        throw new Error(Array.isArray(errorData.password) ? errorData.password[0] : errorData.password);
      }
      if (errorData.non_field_errors) {
        throw new Error(Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors);
      }
    }
    throw error;
  }
};

// ✅ KEEP the old signature for backward compatibility (if needed elsewhere)
export const registerUserOld = async (username: string, email: string, password: string, first_name?: string, last_name?: string) => {
  return registerUser({
    username,
    email,
    password,
    password_confirm: password,
    first_name: first_name || '',
    last_name: last_name || ''
  });
};

export const requestPasswordReset = async (email: string) => {
  console.log('🔒 Requesting password reset for:', email);
  return retryRequest<ResetPasswordResponse>(() => 
    api.post('/api/auth/password-reset/', { email })
  );
};

// ✅ ADDED: Additional auth functions
export const verifyEmail = async (token: string) => {
  console.log('📧 Verifying email with token');
  return retryRequest<{ message: string }>(() =>
    api.post('/api/auth/verify-email/', { token })
  );
};

export const socialAuth = async (provider: string, access_token: string) => {
  console.log('🔗 Social auth with:', provider);
  return retryRequest<LoginResponse>(() =>
    api.post('/api/auth/social-auth/', { provider, access_token })
  );
};

export const resetPassword = async (uid: string, token: string, password: string) => {
  console.log('🔒 Resetting password');
  return retryRequest<ResetPasswordResponse>(() =>
    api.post('/api/auth/password-reset/confirm/', { uid, token, password })
  );
};

// ✅ ADDED: User profile functions
export const getUserProfile = async () => {
  console.log('👤 Fetching user profile');
  return retryRequest<any>(() =>
    api.get('/api/auth/profiles/dashboard/')
  );
};

export const updateUserProfile = async (data: any) => {
  console.log('👤 Updating user profile');
  return retryRequest<any>(() =>
    api.patch('/api/auth/profiles/dashboard/', data)
  );
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  console.log('🔒 Changing password');
  return retryRequest<{ message: string }>(() =>
    api.post('/api/auth/profiles/change_password/', {
      old_password: oldPassword,
      new_password: newPassword
    })
  );
};

// Contact
export const submitContactForm = async (data: { name: string; email: string; message: string }) => {
  console.log('📨 Submitting contact form');
  return retryRequest<any>(() =>
    api.post('/api/contact/', data)
  );
};

// Donations
export const subscribeToPlan = async (plan: string, billingCycle: string, amount: number) => {
  console.log('💳 Creating subscription:', plan, billingCycle, amount);
  return retryRequest<SubscriptionResponse>(() =>
    api.post('/api/donation/create/', { amount, plan, billing_cycle: billingCycle })
  );
};

export default api;