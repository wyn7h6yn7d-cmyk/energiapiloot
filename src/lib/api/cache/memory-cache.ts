type Entry<T> = { value: T; expiresAt: number };

/**
 * Process-local TTL cache. Swap for Redis/Upstash by implementing the same interface later.
 */
export class MemoryCache {
  private store = new Map<string, Entry<unknown>>();

  async getOrSet<T>(key: string, ttlSec: number, factory: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.store.get(key) as Entry<T> | undefined;
    if (hit && hit.expiresAt > now) return hit.value;
    const value = await factory();
    this.store.set(key, { value, expiresAt: now + ttlSec * 1000 });
    return value;
  }

  invalidate(prefix: string) {
    for (const k of this.store.keys()) {
      if (k.startsWith(prefix)) this.store.delete(k);
    }
  }
}

export const globalMemoryCache = new MemoryCache();
