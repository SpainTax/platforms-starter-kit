import { Redis } from '@upstash/redis';

// A minimal in-memory stand-in for Upstash Redis. It is used when the
// KV_REST_API_* environment variables are not configured (for example when
// building a static export for GitHub Pages). It implements just the subset
// of the Redis API that this app relies on and is seeded with demo data so
// the deployed preview has something to show.
function createInMemoryRedis() {
  const store = new Map<string, unknown>();

  // Seed a few demo tenants so the static preview isn't empty.
  const now = Date.now();
  store.set('subdomain:acme', { emoji: '🚀', createdAt: now });
  store.set('subdomain:demo', { emoji: '✨', createdAt: now });
  store.set('subdomain:hello', { emoji: '👋', createdAt: now });

  return {
    async get<T>(key: string): Promise<T | null> {
      return (store.get(key) as T) ?? null;
    },
    async set(key: string, value: unknown): Promise<'OK'> {
      store.set(key, value);
      return 'OK';
    },
    async del(...keys: string[]): Promise<number> {
      let count = 0;
      for (const key of keys) {
        if (store.delete(key)) count++;
      }
      return count;
    },
    async keys(pattern: string): Promise<string[]> {
      // Only the `prefix:*` glob used by this app is supported.
      const prefix = pattern.replace(/\*$/, '');
      return [...store.keys()].filter((key) => key.startsWith(prefix));
    },
    async mget<T>(...keys: string[]): Promise<(T | null)[]> {
      return keys.map((key) => (store.get(key) as T) ?? null);
    }
  };
}

const hasUpstashConfig =
  !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

export const redis = hasUpstashConfig
  ? new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN
    })
  : (createInMemoryRedis() as unknown as Redis);
