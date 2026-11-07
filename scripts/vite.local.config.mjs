// Vite config used by `npm run dev:local` (local testing; never by builds or Vercel).
// The dev-server SSR fix now lives in vite.config.ts (serve only), so plain `npm run dev` works
// too; this file is kept so existing `dev:local` setups keep the same entry point.
import base from '../vite.config.ts';

export default base;
