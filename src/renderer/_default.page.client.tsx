import type { ComponentType } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '../App';
import type { InitialData } from '../components/seo/context';
import '../styles/fonts';
import '../styles/globals.css';

type PageContext = { Page: ComponentType };

const normalize = (p: string) => (p.endsWith('/') ? p : `${p}/`);

function readInitialData(): InitialData {
  const el = document.getElementById('__AGZ_DATA__');
  if (!el?.textContent) return {};
  try {
    return JSON.parse(el.textContent) as InitialData;
  } catch {
    return {};
  }
}

export function render(pageContext: PageContext) {
  const { Page } = pageContext;
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root');

  const app = (
    <AppProviders initialData={readInitialData()}>
      <BrowserRouter>
        <Page />
      </BrowserRouter>
    </AppProviders>
  );

  // Hydrate only when this HTML was prerendered for this exact URL. HTML served for other
  // URLs (edge-rendered new articles, rewrites, unknown paths) is replaced by a fresh render,
  // which avoids hydration mismatches.
  if (root.dataset.path && root.dataset.path === normalize(window.location.pathname) && root.hasChildNodes()) {
    hydrateRoot(root, app);
  } else {
    root.textContent = '';
    createRoot(root).render(app);
  }
}
