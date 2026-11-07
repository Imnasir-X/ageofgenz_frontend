import type { ComponentType } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { prerenderToNodeStream } from 'react-dom/static';
import { StaticRouter } from 'react-router';
import { dangerouslySkipEscape } from 'vite-plugin-ssr/server';
import newsreaderUrl from '@fontsource-variable/newsreader/files/newsreader-latin-opsz-normal.woff2?url';
import geistUrl from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { AppProviders } from '../App';
import type { InitialData, SeoCollector } from '../components/seo/context';
import { buildSeoTags, seoTagsToHtml } from '../components/seo/seo-core';

type PageContext = {
  Page: ComponentType;
  urlOriginal: string;
  initialData?: InitialData;
};

const streamToString = async (stream: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  return Buffer.concat(chunks).toString('utf-8');
};

const escapeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028|\u2029/g, '');

// The two critical faces (headline serif, UI sans) are preloaded; everything else swaps in.
const FONT_PRELOAD = [newsreaderUrl, geistUrl]
  .map((href) => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`)
  .join('\n    ');

export async function render(pageContext: PageContext) {
  const { Page, urlOriginal } = pageContext;
  const initialData = pageContext.initialData ?? {};
  const seo: SeoCollector = { props: null, path: urlOriginal };

  const { prelude } = await prerenderToNodeStream(
    <AppProviders initialData={initialData} seo={seo}>
      <StaticRouter location={urlOriginal}>
        <Page />
      </StaticRouter>
    </AppProviders>,
  );
  const appHtml = await streamToString(prelude);

  const pathname = urlOriginal.split(/[?#]/)[0];
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const head = seoTagsToHtml(buildSeoTags(seo.props ?? { noindex: normalized === '/404/' || normalized === '/__shell/' }, seo.path || pathname));
  const template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');

  const html = template
    .replace('<!--font-preload-->', FONT_PRELOAD)
    .replace('<!--app-head-->', head)
    .replace('<!--root-attrs-->', ` data-path="${normalized.replace(/"/g, '')}"`)
    .replace('<!--app-html-->', appHtml)
    .replace(
      '<!--app-data-->',
      initialData.article || initialData.articleMissing ? `<script id="__AGZ_DATA__" type="application/json">${escapeJson(initialData)}</script>` : '',
    );

  return { documentHtml: dangerouslySkipEscape(html), injectFilter };
}

/** Do not let vite-plugin-ssr preload every font file: only the two critical faces above are preloaded. */
function injectFilter(assets: { assetType: string | null; src: string; inject: false | 'HTML_BEGIN' | 'HTML_END' }[]) {
  assets.forEach((asset) => {
    if (asset.assetType === 'font') asset.inject = false;
  });
}
