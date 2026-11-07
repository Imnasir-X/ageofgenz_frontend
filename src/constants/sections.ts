/**
 * Public sections. URLs are preserved from the previous site; legacy sections
 * (/ai, /culture, /world, /insights, /memes) render their own pages backed by the
 * closest live backend category instead of redirecting away.
 */
export interface Section {
  path: string;
  label: string;
  /** Backend category slug to load. */
  category?: string;
  title: string;
  dek: string;
  kind?: 'opinion' | 'ai' | 'memes' | 'trending';
  /** Category to use when the primary one has no stories yet. */
  fallback?: string;
}

export const SECTIONS: Record<string, Section> = {
  trending: {
    path: '/trending/',
    label: 'Trending',
    title: 'Trending',
    dek: 'What people are talking about right now, with the context to tell whether it matters.',
    kind: 'trending',
  },
  tech: { path: '/tech/', label: 'Tech', category: 'tech', title: 'Tech', dek: 'AI, platforms, devices and the companies shaping the next decade.' },
  ai: {
    path: '/ai/',
    label: 'AI',
    category: 'ai-models-and-agents',
    fallback: 'tech',
    title: 'AI',
    dek: 'Models, agents, policy and power. Plain-language coverage of the technology everyone is arguing about.',
    kind: 'ai',
  },
  politics: { path: '/politics/', label: 'Politics', category: 'politics', title: 'Politics', dek: 'Elections, policy and power, explained without the shouting.' },
  world: { path: '/world/', label: 'World', category: 'global', title: 'World', dek: 'Reporting from Asia to the Americas, with Bangladesh in focus.' },
  global: { path: '/global/', label: 'Global', category: 'global', title: 'Global', dek: 'Reporting from Asia to the Americas, with Bangladesh in focus.' },
  'business-economy': {
    path: '/business-economy/',
    label: 'Business',
    category: 'business-economy',
    title: 'Business & Economy',
    dek: 'Jobs, money, trade and the economy you actually live in.',
  },
  'science-discovery': {
    path: '/science-discovery/',
    label: 'Science',
    category: 'science-discovery',
    title: 'Science & Discovery',
    dek: 'Space, climate, health and the research changing how we live.',
  },
  'pop-media': { path: '/pop-media/', label: 'Pop Media', category: 'pop-media', title: 'Pop Media', dek: 'Film, music, creators and the platforms behind them.' },
  culture: { path: '/culture/', label: 'Culture', category: 'pop-media', title: 'Culture', dek: 'Film, music, creators and the internet’s shifting tastes, read closely.' },
  'crime-justice': { path: '/crime-justice/', label: 'Justice', category: 'crime-justice', title: 'Crime & Justice', dek: 'Courts, policing and civil rights, reported with care.' },
  sports: { path: '/sports/', label: 'Sports', category: 'sports', title: 'Sports', dek: 'Football, cricket, the NBA, esports and the records worth knowing.' },
  opinion: {
    path: '/opinion/',
    label: 'Opinion',
    category: 'opinion',
    title: 'Opinion',
    dek: 'Arguments, not news. Every piece here is its author’s view and is labelled as opinion.',
    kind: 'opinion',
  },
  insights: {
    path: '/insights/',
    label: 'Insights',
    category: 'science-discovery',
    title: 'Insights',
    dek: 'Deeper reads: research, data and the long view on fast-moving stories.',
  },
  memes: {
    path: '/memes/',
    label: 'Memes',
    category: 'platform-wars',
    fallback: 'pop-media',
    title: 'Memes & Internet Culture',
    dek: 'Where the jokes come from and what they say about the moment.',
    kind: 'memes',
  },
};

/** Compact primary navigation. */
export const PRIMARY_NAV = ['trending', 'ai', 'tech', 'politics', 'world', 'business-economy', 'science-discovery', 'sports', 'opinion'] as const;

/** Extra sections for the "More" menu and footer. */
export const SECONDARY_NAV = ['culture', 'pop-media', 'crime-justice', 'insights', 'memes'] as const;

/** Category rails on the home page. */
export const HOME_RAILS = ['tech', 'politics', 'global', 'business-economy', 'science-discovery', 'sports'] as const;

const TOP_LEVEL_ROUTES = new Set(['tech', 'pop-media', 'science-discovery', 'global', 'politics', 'business-economy', 'crime-justice', 'sports', 'opinion', 'trending']);

/** Public URL for a backend category slug, preferring the preserved section URLs. */
export function categoryHref(slug: string): string {
  return TOP_LEVEL_ROUTES.has(slug) ? `/${slug}/` : `/category/${slug}/`;
}
