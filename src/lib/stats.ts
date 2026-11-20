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

export interface TopicStat extends Counts {
  topic: string;
  total: number;
  /** beantwortete Fragen (sicher + wackelig) */
  answered: number;
  /** Anteil sicher 0..1 */
  share: number;
}

export function topicStats(qs: readonly Question[], topics: readonly string[], state: LearnState): TopicStat[] {
  return topics.map((topic) => {
    const list = qs.filter((q) => q.topic === topic);
    const c = masteryCounts(list, state);
    return { topic, total: list.length, ...c, answered: c.sicher + c.wackelig, share: list.length ? c.sicher / list.length : 0 };
  });
}

/**
 * Schwächste Themen: nur Themen mit wackeligen Fragen.
 * Sortiert nach Fehlerquote der bereits geübten Fragen (wackelig / beantwortet),
 * bei Gleichstand nach geringerem Anteil „sicher“. Noch offene Fragen sind keine Schwäche.
 */
export function weakestTopics(stats: readonly TopicStat[], n = 3): TopicStat[] {
  const rate = (s: TopicStat) => s.wackelig / s.answered;
  return stats
    .filter((s) => s.wackelig > 0)
    .slice()
    .sort((a, b) => rate(b) - rate(a) || a.share - b.share)
    .slice(0, n);
}

/** Längste Serie aufeinanderfolgender Lerntage. */
export function longestStreak(days: readonly string[]): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let cur = 0;
  let prev: number | null = null;
  for (const d of sorted) {
    const [y, m, dd] = d.split('-').map(Number);
    const t = Date.UTC(y, m - 1, dd) / 86_400_000;
    cur = prev !== null && t - prev === 1 ? cur + 1 : 1;
    best = Math.max(best, cur);
    prev = t;
  }
  return best;
}
