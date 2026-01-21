import React from 'react';

import type { ContentBlock } from '../types';

interface ArticleContentBlocksProps {
  blocks?: ContentBlock[] | null;
  fallbackContent?: string | null;
  className?: string;
}

const buildFallbackBlocks = (content?: string | null): ContentBlock[] => {
  if (!content) {
    return [];
  }

  const normalized = content
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/blockquote>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');

  const paragraphs = normalized
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  return paragraphs.map((text) => ({ type: 'paragraph', text }));
};

const isKnownBlock = (block: any): block is ContentBlock =>
  Boolean(block && typeof block === 'object' && ['paragraph', 'heading', 'image', 'quote'].includes(block.type));

const ArticleContentBlocks: React.FC<ArticleContentBlocksProps> = ({
  blocks,
  fallbackContent,
  className,
}) => {
  const hasBlocks = Array.isArray(blocks) && blocks.length > 0;
  const htmlFallback =
    !hasBlocks &&
    typeof fallbackContent === 'string' &&
    /<\/?[a-z][\s\S]*>/i.test(fallbackContent);

  if (htmlFallback) {
    // HTML content is sanitized server-side before rendering.
    return <div className={className} dangerouslySetInnerHTML={{ __html: fallbackContent }} />;
  }

  const normalizedBlocks = hasBlocks ? blocks : buildFallbackBlocks(fallbackContent);
  const safeBlocks = normalizedBlocks.filter(isKnownBlock);
  const renderedBlocks = safeBlocks.length > 0 ? safeBlocks : buildFallbackBlocks(fallbackContent);

  if (!renderedBlocks.length) {
    return (
      <div className={className}>
        <p className="text-gray-600">No content available.</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {renderedBlocks.map((block, index) => {
        const key =
          typeof block.id === 'string' && block.id.trim().length > 0 ? block.id : `block-${index}`;

        switch (block.type) {
          case 'paragraph':
            return <p key={key}>{block.text}</p>;
          case 'heading':
            return block.level === 'h3' ? (
              <h3 key={key}>{block.text}</h3>
            ) : (
              <h2 key={key}>{block.text}</h2>
            );
          case 'image': {
            const position = block.position || 'wide';
            const caption = block.caption?.trim();
            const alt = block.alt?.trim() || caption || '';
            return (
              <figure key={key} className={`article-block-image article-block-image--${position}`}>
                <img src={block.url} alt={alt} loading="lazy" />
                {caption && <figcaption>{caption}</figcaption>}
              </figure>
            );
          }
          case 'quote':
            return (
              <blockquote key={key} className="article-block-quote">
                <p>{block.text}</p>
                {block.author && <cite>{block.author}</cite>}
              </blockquote>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default ArticleContentBlocks;
