import { useEffect, useState } from 'preact/hooks';
import { emptyState, type LearnState } from './model';
import { localStorageBackend, type StorageBackend } from './storage';

type Listener = (s: LearnState) => void;

/** Zentraler Lernstand mit Abonnement. Alle Änderungen laufen über update(). */
export class Store {
  private state: LearnState;
  private listeners = new Set<Listener>();
  /** false, wenn das letzte Speichern fehlschlug (z. B. Speicher voll / gesperrt) */
  persistent = true;

  constructor(private backend: StorageBackend) {
    this.state = backend.load() ?? emptyState();
  }

  get(): LearnState {
    return this.state;
  }

  update(fn: (s: LearnState) => LearnState): void {
    const next = fn(this.state);
    if (next === this.state) return;
    this.state = next;
    this.persistent = this.backend.save(next);
    for (const l of this.listeners) l(next);
  }

  /** Ersetzt den kompletten Stand (Import). */
  replace(next: LearnState): void {
    this.update(() => next);
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }
}

export const store = new Store(localStorageBackend());

/** Preact-Hook: liefert den aktuellen Lernstand und rendert bei Änderungen neu. */
export function useLearnState(s: Store = store): LearnState {
  const [state, setState] = useState(s.get());
  useEffect(() => s.subscribe(setState), [s]);
  return state;
}
