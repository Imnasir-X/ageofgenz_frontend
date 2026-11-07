import { createElement, lazy, type ComponentType } from 'react';

export type PreloadableComponent<P> = ComponentType<P> & { preload: () => Promise<unknown> };

/**
 * React.lazy with a preload handle. Once the module has loaded, the component renders it
 * synchronously instead of going through Suspense. The client renderer preloads the current
 * route before hydrating, so hydration never suspends; otherwise any context update during
 * hydration (auth, theme) would force React to throw away the prerendered page and show the
 * Suspense fallback (a full-page layout shift).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyRoute<P = any>(factory: () => Promise<{ default: ComponentType<P> }>): PreloadableComponent<P> {
  let loaded: ComponentType<P> | null = null;
  let pending: Promise<unknown> | null = null;
  const load = () => {
    if (!pending) {
      pending = factory().then(
        (m) => {
          loaded = m.default;
          return m;
        },
        (err) => {
          pending = null;
          throw err;
        },
      );
    }
    return pending as Promise<{ default: ComponentType<P> }>;
  };
  const Lazy = lazy(load);
  const Route = ((props: P) => (loaded ? createElement(loaded as ComponentType<object>, props as object) : createElement(Lazy as unknown as ComponentType<object>, props as object))) as PreloadableComponent<P>;
  Route.preload = load;
  return Route;
}
