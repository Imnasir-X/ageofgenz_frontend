import type { ReactNode } from 'react';
import type { ContentBlock, ParagraphBlock } from '@/lib/api/types';
import { imageSrcSet, optimizeImage } from '@/lib/image';
import { htmlToBlocks, sanitizeHtml } from '@/lib/article/html';
import { cn } from '@/lib/utils';

const HTML_RE = /<\/?[a-z][\s\S]*>/i;



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
                {/* Fixed 16:9 box (image letterboxed inside), so lazy images never push the text around. */}
                <div className="relative aspect-video w-full overflow-hidden rounded-md bg-mist">
                  <img
                    src={optimizeImage(src, 800)}
                    srcSet={imageSrcSet(src, 800)}
                    sizes="(max-width: 720px) calc(100vw - 2.5rem), 680px"
                    alt={block.alt?.trim() || block.caption?.trim() || ''}
                    width={800}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 m-0 h-full w-full object-contain"
                  />
                </div>
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

