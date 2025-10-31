import type { Category } from '../types';
import {
  CATEGORY_TREE,
  CATEGORY_DESCRIPTORS,
  CATEGORY_LOOKUP,
  resolveCategorySlug,
  type CategoryNode,
} from '../constants/categories';

export type NavNode = {
  slug: string;
  name: string;
  children: NavNode[];
};

const ROOT_ORDER_KEY = '__root__';

const cloneCategoryBranch = (node: CategoryNode): NavNode => ({
  slug: node.slug,
  name: node.name,
  children: (node.children ?? []).map(cloneCategoryBranch),
});

const cloneNavBranch = (node: NavNode): NavNode => ({
  slug: node.slug,
  name: node.name,
  children: node.children.map(cloneNavBranch),
});

const cloneNavTree = (nodes: NavNode[]): NavNode[] => nodes.map(cloneNavBranch);

const buildOrderMap = (
  nodes: CategoryNode[],
  parentKey: string = ROOT_ORDER_KEY,
  map: Map<string, string[]> = new Map(),
): Map<string, string[]> => {
  map.set(parentKey, nodes.map((node) => node.slug));
  nodes.forEach((node) => {
    if (node.children && node.children.length > 0) {
      buildOrderMap(node.children, node.slug, map);
    }
  });
  return map;
};

const buildNameMap = (
  nodes: CategoryNode[],
  map: Map<string, string> = new Map(),
): Map<string, string> => {
  nodes.forEach((node) => {
    map.set(node.slug, node.name);
    if (node.children && node.children.length > 0) {
      buildNameMap(node.children, map);
    }
  });
  return map;
};

const FALLBACK_NAV_TREE = CATEGORY_TREE.map(cloneCategoryBranch);
const FALLBACK_ORDER_MAP = buildOrderMap(CATEGORY_TREE);
const FALLBACK_NAME_MAP = buildNameMap(CATEGORY_TREE);
const FALLBACK_NAME_TO_SLUG = CATEGORY_DESCRIPTORS.reduce<Record<string, string>>((map, descriptor) => {
  map[descriptor.name.toLowerCase()] = descriptor.slug;
  return map;
}, {});

const getFallbackCategoryName = (slug: string): string | undefined =>
  FALLBACK_NAME_MAP.get(slug);

const flattenCategories = (
  categories: Category[],
  parentSlug: string | null = null,
  acc: Array<{ slug: string; name: string; parentSlug: string | null }> = [],
): Array<{ slug: string; name: string; parentSlug: string | null }> => {
  categories.forEach((category) => {
    if (!category || !category.slug) {
      return;
    }

    const slug = category.slug;
    const name =
      category.name?.trim() ||
      getFallbackCategoryName(slug) ||
      slug;

    acc.push({
      slug,
      name,
      parentSlug: category.parent_slug ?? parentSlug ?? null,
    });

    if (Array.isArray(category.children) && category.children.length > 0) {
      flattenCategories(category.children as Category[], slug, acc);
    }
  });

  return acc;
};

const sortNavNodes = (nodes: NavNode[], parentKey: string = ROOT_ORDER_KEY): NavNode[] => {
  const order = FALLBACK_ORDER_MAP.get(parentKey);

  nodes.sort((a, b) => {
    if (order) {
      const indexA = order.indexOf(a.slug);
      const indexB = order.indexOf(b.slug);

      if (indexA !== -1 || indexB !== -1) {
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        if (indexA !== indexB) return indexA - indexB;
      }
    }

    return a.name.localeCompare(b.name);
  });

  nodes.forEach((node) => {
    if (node.children.length > 0) {
      sortNavNodes(node.children, node.slug);
    }
  });

  return nodes;
};

const ensureNavNode = (
  slug: string,
  nodeMap: Map<string, NavNode>,
  name?: string,
): NavNode => {
  const existing = nodeMap.get(slug);
  if (existing) {
    if (name && existing.name !== name) {
      existing.name = name;
    }
    return existing;
  }

  const resolvedName =
    name?.trim() ||
    getFallbackCategoryName(slug) ||
    slug;

  const node: NavNode = { slug, name: resolvedName, children: [] };
  nodeMap.set(slug, node);
  return node;
};

export const buildNavTreeFromCategories = (categories: Category[]): NavNode[] => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return getFallbackNavTree();
  }

  const flat = flattenCategories(categories);
  const nodeMap = new Map<string, NavNode>();
  const childSetMap = new Map<string, Set<string>>();
  const roots = new Set<string>();

  flat.forEach((item) => {
    const node = ensureNavNode(item.slug, nodeMap, item.name);
    if (item.parentSlug) {
      const parent = ensureNavNode(item.parentSlug, nodeMap);
      if (!childSetMap.has(parent.slug)) {
        childSetMap.set(parent.slug, new Set<string>());
      }
      const childSet = childSetMap.get(parent.slug)!;
      if (!childSet.has(node.slug)) {
        parent.children.push(node);
        childSet.add(node.slug);
      }
    } else {
      roots.add(node.slug);
    }
  });

  flat.forEach((item) => {
    if (!item.parentSlug || !nodeMap.has(item.parentSlug)) {
      roots.add(item.slug);
    }
  });

  const rootNodes = Array.from(roots)
    .map((slug) => nodeMap.get(slug))
    .filter((node): node is NavNode => Boolean(node));

  sortNavNodes(rootNodes);

  return cloneNavTree(rootNodes);
};

export const getFallbackNavTree = (): NavNode[] => cloneNavTree(FALLBACK_NAV_TREE);

export const HOME_CATEGORY_ORDER = CATEGORY_TREE.map((node) => node.slug);

export const DEFAULT_HOME_CATEGORY_LIMIT = 8;

export const buildHomeCategories = (
  categories?: Category[] | null,
  limit: number = DEFAULT_HOME_CATEGORY_LIMIT,
): Category[] => {
  if (!Array.isArray(categories) || categories.length === 0) {
    return HOME_CATEGORY_ORDER.slice(0, limit).map((slug, index) => {
      const fallbackName = getFallbackCategoryName(slug) || slug;
      return {
        id: -(index + 1),
        name: fallbackName,
        slug,
        parent_slug: null,
      } as Category;
    });
  }

  const topLevel = categories.filter((category) => {
    if (!category || !category.slug) return false;
    if (category.parent_slug && category.parent_slug.length > 0) return false;
    if (category.is_active === false) return false;
    return true;
  });

  const mapBySlug = new Map<string, Category>();
  topLevel.forEach((category) => {
    if (!mapBySlug.has(category.slug)) {
      mapBySlug.set(category.slug, category);
    }
  });

  const ordered: Category[] = [];
  HOME_CATEGORY_ORDER.forEach((slug) => {
    const match = mapBySlug.get(slug);
    if (match) {
      ordered.push({
        ...match,
        name: match.name?.trim() || getFallbackCategoryName(slug) || slug,
        parent_slug: null,
      });
      mapBySlug.delete(slug);
    }
  });

  const leftovers = Array.from(mapBySlug.values()).sort((a, b) =>
    (a.name || a.slug).localeCompare(b.name || b.slug),
  );

  ordered.push(...leftovers);

  return ordered.slice(0, Math.max(1, limit));
};

export const FALLBACK_HOME_CATEGORIES = buildHomeCategories();

export const getFallbackCategoryDisplayName = (slug: string): string =>
  getFallbackCategoryName(slug) || slug;

const getTopLevelSlugInternal = (slug: string): string => {
  const descriptor = CATEGORY_LOOKUP[slug];
  if (!descriptor || descriptor.path.length === 0) {
    return slug;
  }
  return descriptor.path[0];
};

const toSlugLike = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, '-');

export type CategoryMeta = {
  slug: string;
  name: string;
  topLevelSlug: string;
  topLevelName: string;
  isLegacy: boolean;
};

type CategoryLike = Partial<Pick<Category, 'slug' | 'name' | 'parent_slug'>>;

const getNormalizedSlugFromName = (name: string): string | null => {
  const lookup = FALLBACK_NAME_TO_SLUG[name.trim().toLowerCase()];
  if (lookup) {
    return lookup;
  }
  const approximated = toSlugLike(name);
  if (!approximated) {
    return null;
  }
  return resolveCategorySlug(approximated).slug;
};

export const resolveCategoryMeta = (input?: CategoryLike | null): CategoryMeta => {
  const slugCandidate = input?.slug ?? null;
  const nameCandidate = input?.name ?? null;
  const parentCandidate = input?.parent_slug ?? null;

  let normalizedSlug: string | null = null;
  let isLegacy = false;

  if (slugCandidate) {
    const resolution = resolveCategorySlug(slugCandidate);
    normalizedSlug = resolution.slug;
    isLegacy = resolution.isLegacy;
  } else if (nameCandidate) {
    const fromName = getNormalizedSlugFromName(nameCandidate);
    if (fromName) {
      const resolution = resolveCategorySlug(fromName);
      normalizedSlug = resolution.slug;
      isLegacy = isLegacy || resolution.isLegacy;
    }
  }

  if (!normalizedSlug && parentCandidate) {
    const resolution = resolveCategorySlug(parentCandidate);
    normalizedSlug = resolution.slug;
    isLegacy = isLegacy || resolution.isLegacy;
  }

  const fallbackSlug = normalizedSlug ?? 'trending';
  const descriptor = CATEGORY_LOOKUP[fallbackSlug];
  const candidateTopLevelSlug = descriptor?.path?.[0];
  const topLevelSlug = getTopLevelSlugInternal(candidateTopLevelSlug ?? fallbackSlug);
  const topLevelDescriptor = CATEGORY_LOOKUP[topLevelSlug];

  const nameFromDescriptor =
    descriptor?.name ??
    (normalizedSlug ? getFallbackCategoryDisplayName(normalizedSlug) : undefined);

  const topLevelName =
    topLevelDescriptor?.name ??
    getFallbackCategoryDisplayName(topLevelSlug);

  const displayName =
    nameFromDescriptor ??
    (nameCandidate ? nameCandidate.trim() : getFallbackCategoryDisplayName('trending'));

  return {
    slug: fallbackSlug,
    name: displayName,
    topLevelSlug,
    topLevelName,
    isLegacy,
  };
};

export const getTopLevelCategorySlug = (slug: string): string => {
  const normalized = resolveCategorySlug(slug).slug;
  return getTopLevelSlugInternal(normalized);
};
