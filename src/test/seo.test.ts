import { describe, expect, it } from 'vitest';
import { buildSeoTags, seoTagsToHtml } from '@/components/seo/seo-core';

describe('SEO tags', () => {
  it('emits title, canonical with trailing slash, OG and Organization JSON-LD', () => {
    const html = seoTagsToHtml(buildSeoTags({ title: 'Tech', description: 'd', path: '/tech' }));
    expect(html).toContain('<title data-seo>Tech | The Age of GenZ</title>');
    expect(html).toContain('<link rel="canonical" href="https://theageofgenz.com/tech/" data-seo>');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('"@type":"NewsMediaOrganization"');
  });

  it('escapes HTML in JSON-LD and marks noindex pages', () => {
    const html = seoTagsToHtml(buildSeoTags({ title: 'x', noindex: true, jsonLd: { name: '</script><b>' } }));
    expect(html).not.toContain('</script><b>');
    expect(html).toContain('noindex, follow');
  });
});
