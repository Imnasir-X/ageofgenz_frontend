import DOMPurify from 'dompurify';

/**
 * Article HTML allow-list for the Studio editor. The backend renders this HTML on the public
 * site, so we sanitize before saving: no scripts, styles, event handlers, iframes or forms.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
  'blockquote', 'code', 'pre', 'hr', 'figure', 'figcaption', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
];
const ALLOWED_ATTR = ['href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'colspan', 'rowspan'];

export function sanitizeArticleHtml(html: string): string {
  if (typeof window === 'undefined') return html;
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/|#)/i,
  });
  // External links open safely.
  const doc = new DOMParser().parseFromString(`<div>${clean}</div>`, 'text/html');
  doc.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href') ?? '';
    if (/^https?:/i.test(href)) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });
  return doc.body.firstElementChild?.innerHTML ?? clean;
}

export const plainText = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
