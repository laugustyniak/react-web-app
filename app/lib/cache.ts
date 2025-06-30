interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

const CACHE_PREFIX = 'app_cache_';

// Helper to check if we're in browser environment
const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export class Cache {
  static set<T>(key: string, data: T, expiresInMs: number): void {
    if (!isBrowser) return;

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresInMs,
    };
    
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
    } catch (error) {
      // Silently fail if localStorage is full or unavailable
    }
  }

  static get<T>(key: string): T | null {
    if (!isBrowser) return null;

    try {
      const stored = localStorage.getItem(CACHE_PREFIX + key);
      if (!stored) return null;

      const item: CacheItem<T> = JSON.parse(stored);
      const now = Date.now();
      
      if (now - item.timestamp > item.expiresIn) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return item.data;
    } catch (error) {
      return null;
    }
  }

  static clear(key: string): void {
    if (!isBrowser) return;
    localStorage.removeItem(CACHE_PREFIX + key);
  }

  static clearAll(): void {
    if (!isBrowser) return;
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

export const CACHE_DURATIONS = {
  TWELVE_HOURS: 12 * 60 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  THIRTY_MINUTES: 30 * 60 * 1000,
} as const; 