import type { Question } from '../data/types';

/** hit = richtig gewählt, missed = richtig aber nicht gewählt, wrong = falsch gewählt, none = falsch und nicht gewählt */
export type OptionMark = 'hit' | 'missed' | 'wrong' | 'none';

export function isMulti(q: Question): boolean {
  return q.type === 'mc' && (q.correct?.length ?? 0) > 1;
}

/** Richtig nur, wenn genau die richtigen Optionen gewählt wurden (alle, keine zusätzlichen). */
export function evaluateMc(q: Question, selected: readonly number[]): { correct: boolean; marks: OptionMark[] } {
  const right = new Set(q.correct ?? []);
  const sel = new Set(selected);
  const marks: OptionMark[] = (q.options ?? []).map((_, i) =>
    right.has(i) ? (sel.has(i) ? 'hit' : 'missed') : sel.has(i) ? 'wrong' : 'none',
  );
  const correct = right.size > 0 && sel.size === right.size && [...sel].every((i) => right.has(i));
  return { correct, marks };
}

/** Auswahl umschalten: Einfachauswahl ersetzt, Mehrfachauswahl toggelt. */
export function toggleOption(q: Question, selected: readonly number[], i: number): number[] {
  if (!isMulti(q)) return [i];
  return selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i].sort((a, b) => a - b);
}
