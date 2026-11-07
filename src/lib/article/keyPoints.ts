import type { Article } from '@/lib/api/types';
import { stripHtml, truncate } from '@/lib/utils';

const norm = (t: string) => t.replace(/\s+/g, ' ').trim().toLowerCase();

/** Extractive key points: the opening sentence of the first paragraphs that aren't the standfirst. */
export function keyPoints(article: Article, max = 3): string[] {
  const paragraphs = article.contentBlocks?.length
    ? article.contentBlocks.filter((b) => b.type === 'paragraph').map((b) => (b.type === 'paragraph' ? b.text : ''))
    : stripHtml(article.content.replace(/<\/p>/gi, '\n\n')).split(/\n\s*\n/);
  const excerpt = norm(article.excerpt);
  const out: string[] = [];
  for (const p of paragraphs) {
    const text = p.trim();
    if (!text || norm(text) === excerpt || text.length < 60) continue;
    const sentence = text.match(/^.+?[.!?](?=\s+[A-Z“"‘']|$)/)?.[0] ?? text;
    out.push(truncate(sentence, 240));
    if (out.length >= max) break;
  }
  return out;
}
