import type { Question } from '../data/types';

/** Fisher-Yates; `rnd` austauschbar für Tests. */
export function shuffle<T>(arr: readonly T[], rnd: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Leere Themenliste = alle Themen. */
export function filterByTopics(qs: readonly Question[], topics: readonly string[]): Question[] {
  if (topics.length === 0) return qs.slice();
  const set = new Set(topics);
  return qs.filter((q) => set.has(q.topic));
}

export function buildDeck(qs: readonly Question[], opts: { topics: readonly string[]; shuffle: boolean }, rnd?: () => number): Question[] {
  const list = filterByTopics(qs, opts.topics);
  return opts.shuffle ? shuffle(list, rnd) : list;
}
