/** Local fallback (the old /api/placeholder/... path never existed in production). */
export const PLACEHOLDER_IMAGE = '/placeholder.jpg';

/** Cloudinary images get an automatic format/quality/width transform. */
export function optimizeImage(url: string, width: number): string {
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}
