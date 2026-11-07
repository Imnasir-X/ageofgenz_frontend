import type { ContentBlock } from '@/lib/api/types';

/**
 * Defence in depth: the backend sanitises HTML with bleach on save, but we also strip
 * scripts, inline handlers and javascript: URLs before rendering.
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<(script|style|object|embed|form)[\s\S]*?<\/\1>/gi, '')
    .replace(/<(script|style|object|embed|form|meta|link|base)[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src|xlink:href)\s*=\s*("|')\s*(javascript|vbscript|data:text\/html)[^"']*\2/gi, '$1="#"');
}

export function htmlToBlocks(content: string): ContentBlock[] {
  return content
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map((text) => ({ type: 'paragraph' as const, text }));
}

/** External links cited in the story, used as a sources fallback. */
export function extractLinks(blocks: ContentBlock[] | null, content: string): { title: string; url: string; publisher?: string }[] {
  const out = new Map<string, string>();
  (blocks ?? []).forEach((b) => {
    if (b.type !== 'paragraph') return;
    (b.links ?? []).forEach((l) => {
      const url = l.url ?? l.href;
      if (url && /^https?:\/\//.test(url) && !url.includes('theageofgenz.com')) out.set(url, l.text || url);
    });
  });
  const re = /<a\s[^>]*href=("|')(https?:\/\/[^"']+)\1[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    if (!m[2].includes('theageofgenz.com')) out.set(m[2], m[3].replace(/<[^>]+>/g, '').trim() || m[2]);
  }
  return Array.from(out, ([url, title]) => {
    let publisher: string | undefined;
    try {
      publisher = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      publisher = undefined;
    }
    return { url, title, publisher };
  });
}
