import { emptyState, normalizeState, type LearnState } from './model';

/**
 * Speicher-Schnittstelle. Heute: localStorage. Später kann hier ein Sync-Backend
 * (z. B. Server oder Cloud-Datei) eingesetzt werden, ohne die App zu ändern.
 */
export interface StorageBackend {
  load(): LearnState | null;
  save(state: LearnState): boolean;
  clear(): void;
}

const KEY = 'elearning.state.v1';

export function localStorageBackend(key = KEY): StorageBackend {
  // Fallback im Arbeitsspeicher, falls localStorage gesperrt ist (privater Modus o. Ä.)
  let memory: string | null = null;
  const get = (): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory;
    }
  };
  return {
    load() {
      const raw = get();
      if (!raw) return null;
      try {
        return normalizeState(JSON.parse(raw));
      } catch {
        return null;
      }
    },
    save(state) {
      const raw = JSON.stringify(state);
      memory = raw;
      try {
        window.localStorage.setItem(key, raw);
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      memory = null;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignorieren */
      }
    },
  };
}

export function memoryBackend(initial: LearnState | null = null): StorageBackend {
  let s = initial ? JSON.stringify(initial) : null;
  return {
    load: () => (s ? normalizeState(JSON.parse(s)) : null),
    save: (st) => ((s = JSON.stringify(st)), true),
    clear: () => (s = null),
  };
}

export { emptyState };
