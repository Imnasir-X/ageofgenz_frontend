// Vite config overlay used only by `npm run dev:local` (local testing; never by builds or Vercel).
// The dev server renders pages through Vite's SSR module runner. For react-router(-dom) v7 the
// "node" export condition picks the CommonJS build, whose named exports the runner cannot read
// ("Named export 'useParams' not found"). Asking for the "module-sync" condition selects the
// package's ESM build instead. This fixes dev without touching vite.config.ts (production build
// and prerender keep their own settings).
import { mergeConfig } from 'vite';
import base from '../vite.config.ts';

export default mergeConfig(base, {
  ssr: { resolve: { externalConditions: ['node', 'module-sync'] } },
});
