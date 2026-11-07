/** Tiny in-memory request cache so sections sharing a list (latest, a category) fetch once per visit. */
const store = new Map<string, { at: number; promise: Promise<unknown> }>();
const TTL = 5 * 60 * 1000;

export function cached<T>(key: string, loader: () => Promise<T>, ttl = TTL): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttl) return hit.promise as Promise<T>;
  const promise = loader().catch((err) => {
    store.delete(key);
    throw err;
  });
  store.set(key, { at: Date.now(), promise });
  return promise;
}

export function clearCache() {
  store.clear();
}
