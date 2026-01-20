import type { ComponentType } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import ReactDOMServer from 'react-dom/server';
import { StaticRouter } from 'react-router';
import type { HelmetServerState } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';
import { dangerouslySkipEscape } from 'vite-plugin-ssr/server';

type PageContext = {
  Page: ComponentType;
  urlOriginal: string;
};

export async function render(pageContext: PageContext) {
  const helmetContext = {} as { helmet?: HelmetServerState };
  const { Page, urlOriginal } = pageContext;

  const pageHtml = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <AuthProvider>
        <StaticRouter location={urlOriginal}>
          <Page />
        </StaticRouter>
      </AuthProvider>
    </HelmetProvider>,
  );

  const helmet = helmetContext.helmet;
  const headTags = [
    helmet?.title?.toString() || '',
    helmet?.meta?.toString() || '',
    helmet?.link?.toString() || '',
    helmet?.script?.toString() || '',
  ].join('');

  const templatePath = path.resolve(process.cwd(), 'index.html');
  const template = fs.readFileSync(templatePath, 'utf-8');
  const html = template
    .replace('<!--app-head-->', headTags)
    .replace('<div id="root"></div>', `<div id="root">${pageHtml}</div>`);

  return {
    documentHtml: dangerouslySkipEscape(html),
  };
}
