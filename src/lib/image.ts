const isCloudinary = (url: string) => url.includes('res.cloudinary.com') && url.includes('/upload/');
const hasTransform = (url: string) => /\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url);

/** Cloudinary images get an automatic format/quality/width transform. Other hosts are returned as-is. */
export function optimizeImage(url: string, width: number): string {
  if (!isCloudinary(url) || hasTransform(url)) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${Math.round(width)}/`);
}

/** Candidate widths for responsive images. */
export const IMAGE_WIDTHS = [240, 360, 480, 640, 800, 1024, 1280, 1600] as const;

/**
 * Responsive source set for an image displayed at up to `maxWidth` CSS pixels.
 * Only Cloudinary URLs can be resized, so other hosts get no srcset (one src, browser scales).
 */
export function imageSrcSet(url: string, maxWidth: number): string | undefined {
  if (!isCloudinary(url) || hasTransform(url)) return undefined;
  const cap = Math.min(1600, Math.max(240, maxWidth * 2));
  const widths: number[] = IMAGE_WIDTHS.filter((w) => w <= cap);
  return widths.map((w) => `${optimizeImage(url, w)} ${w}w`).join(', ');
}
