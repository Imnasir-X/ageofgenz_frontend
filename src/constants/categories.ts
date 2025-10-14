export const CATEGORY_SLUGS = {
  ai: 'ai',
  politics: 'politics',
  culture: 'culture',
  sports: 'sports',
  memes: 'memes',
  opinion: 'opinion',
  insights: 'insights',
  world: 'world',
} as const;

export type CategorySlug = typeof CATEGORY_SLUGS[keyof typeof CATEGORY_SLUGS];

