type Entry<T> = { value: T; expiresAt: number };

const MAX_ENTRIES = 300;
const cache = new Map<string, Entry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

// Module-scope TTL cache with in-flight de-duplication: DummyJSON allows 100 requests / 10 s per
// IP and every SSR visitor shares that budget. Only successes are cached.
export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.value as T;

  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = load()
    .then((value) => {
      if (cache.size >= MAX_ENTRIES) cache.clear();
      cache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, promise);
  return promise;
}

export function clearCache(): void {
  cache.clear();
  inFlight.clear();
}
