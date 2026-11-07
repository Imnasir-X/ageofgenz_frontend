import type { ReactNode } from 'react';
import type { ContentBlock, ParagraphBlock } from '@/lib/api/types';
import { optimizeImage } from '@/components/news/StoryImage';
import { cn } from '@/lib/utils';

const HTML_RE = /<\/?[a-z][\s\S]*>/i;

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

const safeUrl = (url?: string) => (url && /^(https?:)?\/\//i.test(url) ? url : url?.startsWith('/') ? url : undefined);

function renderParagraph(block: ParagraphBlock): ReactNode {
  const links = (block.links ?? [])
    .map((l) => ({ text: l.text?.trim(), url: safeUrl(l.url ?? l.href) }))
    .filter((l): l is { text: string; url: string } => Boolean(l.text && l.url && block.text.includes(l.text)));
  if (!links.length) return block.text;
  const parts: ReactNode[] = [];
  let rest = block.text;
  links.forEach((link, i) => {
    const at = rest.indexOf(link.text);
    if (at < 0) return;
    if (at > 0) parts.push(rest.slice(0, at));
    const external = /^(https?:)?\/\//i.test(link.url);
    parts.push(
      <a key={i} href={link.url} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {link.text}
      </a>,
    );
    rest = rest.slice(at + link.text.length);
  });
  parts.push(rest);
  return parts;
}

export function ArticleBody({ blocks, content, className }: { blocks: ContentBlock[] | null; content: string; className?: string }) {
  if ((!blocks || blocks.length === 0) && content && HTML_RE.test(content)) {
    return <div className={cn('article-body', className)} dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />;
  }
  const list = blocks && blocks.length ? blocks : htmlToBlocks(content);
  if (!list.length) {
    return (
      <div className={cn('article-body', className)}>
        <p className="text-muted-foreground">This story has no body text yet.</p>
      </div>
    );
  }
  return (
    <div className={cn('article-body', className)}>
      {list.map((block, i) => {
        const key = block.id || `b${i}`;
        switch (block.type) {
          case 'heading':
            return block.level === 'h3' ? <h3 key={key}>{block.text}</h3> : <h2 key={key}>{block.text}</h2>;
          case 'quote':
            return (
              <blockquote key={key}>
                <p>{block.text}</p>
                {block.author && <cite>— {block.author}</cite>}
              </blockquote>
            );
          case 'image': {
            const src = safeUrl(block.url);
            if (!src) return null;
            return (
              <figure key={key} className={cn(block.position === 'center' && 'mx-auto max-w-md')}>
                <img src={optimizeImage(src, 1200)} alt={block.alt?.trim() || block.caption?.trim() || ''} loading="lazy" decoding="async" />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          }
          default:
            return <p key={key}>{renderParagraph(block as ParagraphBlock)}</p>;
        }
      })}
    </div>
  );
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
