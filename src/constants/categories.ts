export interface CategoryNode {
  slug: string;
  name: string;
  children?: CategoryNode[];
}

export interface CategoryDescriptor {
  slug: string;
  name: string;
  parentSlug: string | null;
  path: string[];
  node: CategoryNode;
}

export const CATEGORY_TREE: CategoryNode[] = [
  {
    slug: 'trending',
    name: 'Trending',
  },
  {
    slug: 'tech',
    name: 'Tech',
    children: [
      { slug: 'robotics-automation', name: 'Robotics & Automation' },
      { slug: 'review-launch', name: 'Review & Launch' },
      { slug: 'ai-models-and-agents', name: 'AI Models & Agents' },
      { slug: 'energy-future', name: 'Energy Future' },
      { slug: 'future-tech', name: 'Future Tech' },
    ],
  },
  {
    slug: 'pop-media',
    name: 'Pop Media',
    children: [
      { slug: 'film-tv', name: 'Film & TV' },
      { slug: 'music-charts', name: 'Music & Charts' },
      { slug: 'pop-icons', name: 'Pop Icons' },
      { slug: 'platform-wars', name: 'Platform Wars' },
    ],
  },
  {
    slug: 'science-discovery',
    name: 'Science & Discovery',
    children: [
      { slug: 'beyond-space', name: 'Beyond Space' },
      { slug: 'earth-matters', name: 'Earth Matters' },
      { slug: 'life-science', name: 'Life Science' },
      { slug: 'science-today', name: 'Science Today' },
      { slug: 'nature-decode', name: 'Nature Decode' },
      { slug: 'natural-forces', name: 'Natural Forces' },
    ],
  },
  {
    slug: 'global',
    name: 'Global',
    children: [
      {
        slug: 'asia',
        name: 'Asia',
        children: [{ slug: 'bangladesh', name: 'Bangladesh' }],
      },
      { slug: 'europe', name: 'Europe' },
      { slug: 'middle-east', name: 'Middle East' },
      { slug: 'africa', name: 'Africa' },
      { slug: 'america', name: 'America (Combined North+South)' },
      { slug: 'australia', name: 'Australia' },
    ],
  },
  {
    slug: 'politics',
    name: 'Politics',
    children: [
      { slug: 'u-s-politics', name: 'U.S. Politics' },
      { slug: 'world-politics', name: 'World Politics' },
      { slug: 'elections', name: 'Elections' },
      { slug: 'opinion', name: 'Opinion' },
    ],
  },
  {
    slug: 'business-economy',
    name: 'Business & Economy',
    children: [
      { slug: 'economy-gdp', name: 'Economy & GDP' },
      { slug: 'industry-manufacturing', name: 'Industry & Manufacturing' },
      { slug: 'trade-investment', name: 'Trade & Investment' },
      { slug: 'jobs-employment', name: 'Jobs & Employment' },
      { slug: 'finance-banking', name: 'Finance & Banking' },
    ],
  },
  {
    slug: 'crime-justice',
    name: 'Crime & Justice',
    children: [
      { slug: 'shootings', name: 'Shootings' },
      { slug: 'law-enforcement', name: 'Law Enforcement' },
      { slug: 'social-civil-rights', name: 'Social & Civil Rights' },
    ],
  },
  {
    slug: 'sports',
    name: 'Sports',
    children: [
      { slug: 'football-soccer', name: 'Football & Soccer' },
      { slug: 'nba', name: 'NBA' },
      { slug: 'cricket', name: 'Cricket' },
      { slug: 'tennis', name: 'Tennis' },
      { slug: 'esports', name: 'Esports' },
      { slug: 'top-records', name: 'Top Records' },
    ],
  },
];

export const LEGACY_CATEGORY_SLUG_MAP: Record<string, string> = {
  ai: 'tech',
  culture: 'pop-media',
  insights: 'science-discovery',
  memes: 'trending',
  world: 'global',
};

const buildDescriptors = (
  nodes: CategoryNode[],
  parentSlug: string | null = null,
  path: string[] = [],
): CategoryDescriptor[] => {
  const descriptors: CategoryDescriptor[] = [];

  nodes.forEach((node) => {
    const currentPath = [...path, node.slug];
    descriptors.push({
      slug: node.slug,
      name: node.name,
      parentSlug,
      path: currentPath,
      node,
    });

    if (node.children && node.children.length > 0) {
      descriptors.push(...buildDescriptors(node.children, node.slug, currentPath));
    }
  });

  return descriptors;
};

export const CATEGORY_DESCRIPTORS: CategoryDescriptor[] = buildDescriptors(CATEGORY_TREE);

export const CATEGORY_LOOKUP: Record<string, CategoryDescriptor> = CATEGORY_DESCRIPTORS.reduce(
  (acc, descriptor) => {
    acc[descriptor.slug] = descriptor;
    return acc;
  },
  {} as Record<string, CategoryDescriptor>,
);

export const CATEGORY_SLUG_LIST = CATEGORY_DESCRIPTORS.map((descriptor) => descriptor.slug);

export const CATEGORY_SLUG_SET = new Set(CATEGORY_SLUG_LIST);

export const TOP_LEVEL_CATEGORY_SLUGS = CATEGORY_TREE.map((node) => node.slug);

export const resolveCategorySlug = (input: string) => {
  const slug = input.toLowerCase();

  if (CATEGORY_SLUG_SET.has(slug)) {
    return { slug, isLegacy: false };
  }

  const mapped = LEGACY_CATEGORY_SLUG_MAP[slug];
  if (mapped) {
    return { slug: mapped, isLegacy: true };
  }

  return { slug, isLegacy: false };
};

export const isKnownCategorySlug = (slug: string) =>
  CATEGORY_SLUG_SET.has(slug) || Boolean(LEGACY_CATEGORY_SLUG_MAP[slug.toLowerCase()]);

