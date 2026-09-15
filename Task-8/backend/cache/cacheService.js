// Task 8: simple in-memory TTL cache (swap for Redis in production —
// the get/set/del interface below matches ioredis closely enough that
// migrating later is mostly a constructor change).
class CacheService {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlMs = 60000) {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  del(key) {
    this.store.delete(key);
  }
}

module.exports = new CacheService();
