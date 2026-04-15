function isClient(): boolean {
  return typeof window !== "undefined";
}

export const storage = {
  get<T>(key: string): T | null {
    if (!isClient()) return null;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },
  getString(key: string): string | null {
    if (!isClient()) return null;
    return localStorage.getItem(key);
  },

  set<T>(key: string, value: T): void {
    if (!isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`[storage] Failed to set key "${key}":`, err);
    }
  },
  setString(key: string, value: string): void {
    if (!isClient()) return;
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error(`[storage] Failed to set key "${key}":`, err);
    }
  },
  remove(key: string): void {
    if (!isClient()) return;
    localStorage.removeItem(key);
  },
  clear(): void {
    if (!isClient()) return;
    localStorage.clear();
  },
};
