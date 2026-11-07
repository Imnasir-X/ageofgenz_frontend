import { CATEGORY_LOOKUP } from '@/constants/categories';

/**
 * Category tints for the branded no-image cover. All sit close to Signal Blue so the site
 * still reads as one brand; they only nudge the hue so sections are distinguishable.
 * Values are space-separated RGB channels for use in rgb(var(--tint) / a).
 */
const TINTS: Record<string, string> = {
  tech: '0 71 255', // Signal Blue
  politics: '76 61 255', // indigo
  global: '0 122 204', // ocean
  'business-economy': '0 128 128', // teal
  'science-discovery': '0 150 136', // green-teal
  sports: '0 102 255',
  'pop-media': '112 64 255', // violet
  'crime-justice': '70 80 120', // slate blue
  opinion: '40 50 90', // deep ink-blue
  trending: '0 71 255',
};

export function coverTint(slug?: string): string {
  if (!slug) return TINTS.tech;
  const top = CATEGORY_LOOKUP[slug]?.path?.[0] ?? slug;
  return TINTS[top] ?? TINTS[slug] ?? TINTS.tech;
}
