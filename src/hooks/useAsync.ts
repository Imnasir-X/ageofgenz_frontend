import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  error: Error | null;
  loading: boolean;
  reload: () => void;
}

/**
 * Run an async loader whenever `key` changes, aborting stale requests.
 * Pass `initial` (e.g. prerendered data) to start with data and skip the first load.
 */
export function useAsync<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  key: string,
  options: { initial?: T; enabled?: boolean } = {},
): AsyncState<T> {
  const { initial, enabled = true } = options;
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const skipFirst = useRef(initial !== undefined);
  const [tick, setTick] = useState(0);
  const [state, setState] = useState<{ data: T | undefined; error: Error | null; loading: boolean }>({
    data: initial,
    error: null,
    loading: initial === undefined && enabled,
  });

  useEffect(() => {
    if (!enabled) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    loaderRef
      .current(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setState((s) => ({ ...s, error: error instanceof Error ? error : new Error(String(error)), loading: false }));
      });
    return () => controller.abort();
  }, [key, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}
