import type { Question } from '../data/types';
import { dayKey, isDue, mastery, type LearnState, type Mastery } from '../store/model';

export type Counts = Record<Mastery, number>;

export function masteryCounts(qs: readonly Question[], state: LearnState): Counts {
  const c: Counts = { sicher: 0, wackelig: 0, offen: 0 };
  for (const q of qs) c[mastery(state.cards[q.id])]++;
  return c;
}

export function dueQuestions(qs: readonly Question[], state: LearnState, today = dayKey()): Question[] {
  return qs.filter((q) => isDue(state.cards[q.id], today));
}

/** Alle Fragen, die gerade im Fehler-Training sind (fällig oder nicht). */
export function trainingQuestions(qs: readonly Question[], state: LearnState): Question[] {
  return qs.filter((q) => (state.cards[q.id]?.level ?? 0) > 0);
}
