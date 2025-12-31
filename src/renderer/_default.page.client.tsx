import type { ComponentType } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from '../context/AuthContext';

type PageContext = {
  Page: ComponentType;
};

export function render(pageContext: PageContext) {
  const { Page } = pageContext;
  const root = document.getElementById('root');

  if (!root) {
    throw new Error('Missing root element for hydration.');
  }

  hydrateRoot(
    root,
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Page />
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>,
  );
}
