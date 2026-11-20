import type { Question } from '../data/types';
import { dayKey, type LearnState } from '../store/model';
import { filterByTopics, shuffle as shuffleList } from './select';
import { dueQuestions } from './stats';

/** Neue (noch nie beantwortete) Fragen pro „Weiterlernen“-Runde. */
export const NEW_PER_SESSION = 10;

export interface LearnPlan {
  due: Question[];
  fresh: Question[];
  /** Fragen im Fehler-Training, die noch nicht fällig sind (für „trotzdem üben“) */
  waiting: Question[];
}

/** Plan für „Weiterlernen“ in der aktuellen Themenauswahl. */
export function learnPlan(all: readonly Question[], state: LearnState, today = dayKey(), rnd?: () => number): LearnPlan {
  const pool = filterByTopics(all, state.settings.topics);
  const due = dueQuestions(pool, state, today);
  const unseen = pool.filter((q) => !state.cards[q.id]);
  const fresh = (state.settings.shuffle ? shuffleList(unseen, rnd) : unseen).slice(0, NEW_PER_SESSION);
  const waiting = pool.filter((q) => (state.cards[q.id]?.level ?? 0) > 0 && !due.includes(q));
  return { due, fresh, waiting };
}

/** Reihenfolge: zuerst fällige Wiederholungen, dann neue Fragen. */
export function learnIds(plan: LearnPlan, shuffle: boolean, rnd?: () => number): string[] {
  const due = shuffle ? shuffleList(plan.due, rnd) : plan.due;
  return [...due, ...plan.fresh].map((q) => q.id);
}

export function planLabel(plan: LearnPlan): string {
  const d = plan.due.length;
  const f = plan.fresh.length;
  const parts: string[] = [];
  if (d) parts.push(`${d} ${d === 1 ? 'Wiederholung' : 'Wiederholungen'}`);
  if (f) parts.push(`${f} ${f === 1 ? 'neue Frage' : 'neue Fragen'}`);
  return parts.join(' + ');
}
